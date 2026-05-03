import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputBase, IconButton, Typography, makeStyles, TextField, Checkbox, Box
} from '@material-ui/core';
import { Autocomplete, Alert } from '@material-ui/lab';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import DeleteIcon from '@material-ui/icons/Delete';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import http from '../http-common';

const useStyles = makeStyles({
  table: {
    tableLayout: 'fixed',
    '& th, & td': {
      borderRight: '1px solid rgba(224, 224, 224, 1)',
    },
    '& th:last-child, & td:last-child': {
      borderRight: 'none',
    },
  },
  actualCell: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    color: 'rgba(0, 0, 0, 0.6)',
    padding: '4px 8px',
  },
  sectionDivider: {
    borderLeft: '2px solid rgba(0, 0, 0, 0.2)',
  },
  lockedCell: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    color: 'rgba(0, 0, 0, 0.4)',
    padding: '4px 8px',
    cursor: 'default',
  },
  dragHandle: {
    cursor: 'grab',
    color: 'rgba(0, 0, 0, 0.3)',
    padding: '4px 2px',
    width: 30,
    textAlign: 'center',
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.6)',
    },
  },
  dragOver: {
    borderTop: '2px solid #1976d2',
  },
});

let nextId = 1;

const todayStr = () => new Date().toISOString().slice(0, 10);

const makeEmptyRow = (members) => ({
  id: nextId++,
  date: todayStr(),
  vendor: '',
  description: '',
  amountLocal: '',
  amount: '',
  paidBy: '',
  equalSplit: false,
  splits: members.reduce((acc, m) => ({ ...acc, [m]: '' }), {}),
});

const autoSplit = (amount, members) => {
  const num = parseFloat(amount);
  if (!num || !members.length) return members.reduce((acc, m) => ({ ...acc, [m]: '' }), {});
  const base = Math.floor((num / members.length) * 100) / 100;
  const remainder = Math.round((num - base * members.length) * 100) / 100;
  return members.reduce((acc, m, i) => {
    acc[m] = i === members.length - 1 ? base + remainder : base;
    return acc;
  }, {});
};

const computeActualSpends = (amount, splits, members, equalSplit) => {
  const total = parseFloat(amount);
  if (!total) return members.reduce((acc, m) => ({ ...acc, [m]: null }), {});
  if (equalSplit) return autoSplit(total, members);
  const splitValues = members.map(m => parseFloat(splits[m]) || 0);
  const splitSum = splitValues.reduce((a, b) => a + b, 0);
  if (!splitSum) return members.reduce((acc, m) => ({ ...acc, [m]: null }), {});
  return members.reduce((acc, m, i) => {
    acc[m] = Math.round((splitValues[i] / splitSum) * total * 100) / 100;
    return acc;
  }, {});
};

const computeSettlements = (rows, members) => {
  const totalPaid = members.reduce((acc, m) => ({ ...acc, [m]: 0 }), {});
  const totalOwed = members.reduce((acc, m) => ({ ...acc, [m]: 0 }), {});

  for (const row of rows) {
    const actuals = computeActualSpends(row.amount, row.splits, members, row.equalSplit);
    for (const m of members) {
      if (actuals[m] != null) totalOwed[m] += actuals[m];
    }
    const amt = parseFloat(row.amount) || 0;
    if (amt && row.paidBy && members.includes(row.paidBy)) {
      totalPaid[row.paidBy] += amt;
    }
  }

  const balances = members.map(m => ({
    name: m,
    balance: Math.round((totalPaid[m] - totalOwed[m]) * 100) / 100,
  }));

  const debtors = balances.filter(b => b.balance < 0).map(b => ({ ...b }));
  const creditors = balances.filter(b => b.balance > 0).map(b => ({ ...b }));
  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const settlements = [];
  let d = 0, c = 0;
  while (d < debtors.length && c < creditors.length) {
    const transfer = Math.min(Math.abs(debtors[d].balance), creditors[c].balance);
    const rounded = Math.round(transfer * 100) / 100;
    if (rounded > 0) {
      settlements.push({ from: debtors[d].name, to: creditors[c].name, amount: rounded });
    }
    debtors[d].balance += transfer;
    creditors[c].balance -= transfer;
    if (Math.abs(debtors[d].balance) < 0.01) d++;
    if (Math.abs(creditors[c].balance) < 0.01) c++;
  }

  return settlements;
};

const rowToPayload = (row) => {
  const splits = {};
  Object.entries(row.splits).forEach(([k, v]) => {
    const num = parseFloat(v);
    if (!isNaN(num)) splits[k] = num;
  });
  return {
    date: row.date,
    vendor: row.vendor,
    description: row.description,
    amountLocal: parseFloat(row.amountLocal) || 0,
    amount: parseFloat(row.amount) || 0,
    paidBy: row.paidBy,
    equalSplit: row.equalSplit,
    splits,
  };
};

const ExpenseRow = ({ row, isDraft, members, isMultiCurrency, editingCell, onCellClick, onCellChange, onCellBlur, onKeyDown, onEnterFromRow, onDelete, onToggleEqual, inputRef, classes, draggingId, dragOverId, onDragStart, onDragOver, onDrop, onDragEnd }) => {
  const isEditing = (field) => editingCell && editingCell.rowId === row.id && editingCell.field === field;
  const acOpenRef = useRef(false);

  const cellStyle = { cursor: 'pointer', padding: '4px 8px', userSelect: 'none' };
  const inputStyle = { fontSize: '0.8125rem', width: '100%' };

  const renderCell = (field, value, type = 'text') => {
    // If equalSplit is on, split cells are read-only
    if (row.equalSplit && field.startsWith('split_')) {
      const display = value !== '' ? parseFloat(value).toFixed(2) : '\u00A0';
      return (
        <TableCell key={field} className={classes.lockedCell}>
          {display}
        </TableCell>
      );
    }

    if (isEditing(field)) {
      if (field === 'date') {
        const dateVal = value ? new Date(value + 'T00:00:00') : new Date();
        const handleDateChange = (d) => {
          if (d && !isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            onCellChange(row.id, 'date', `${yyyy}-${mm}-${dd}`);
          }
        };
        const handleDateKeyDown = (e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const current = value ? new Date(value + 'T00:00:00') : new Date();
            if (isNaN(current.getTime())) return;
            const next = new Date(current);
            next.setDate(next.getDate() + (e.key === 'ArrowUp' ? 1 : -1));
            handleDateChange(next);
          } else {
            onKeyDown(e, row.id, field);
          }
        };
        return (
          <TableCell style={{ padding: '4px 8px' }}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="yyyy-MM-dd"
                value={dateVal}
                onChange={handleDateChange}
                onKeyDown={handleDateKeyDown}
                onClose={() => onCellBlur(row.id)}
                autoOk
                InputAdornmentProps={{ style: { display: 'none' } }}
                InputProps={{ disableUnderline: true, style: inputStyle }}
                inputProps={{ style: { padding: '2px 0' } }}
                style={{ width: '100%' }}
              />
            </MuiPickersUtilsProvider>
          </TableCell>
        );
      }
      if (field === 'paidBy') {
        return (
          <TableCell style={{ padding: '4px 8px' }}>
            <Autocomplete
              value={value || null}
              onChange={(_, v) => onCellChange(row.id, field, v || '')}
              onOpen={() => { acOpenRef.current = true; }}
              onClose={() => { acOpenRef.current = false; }}
              onBlur={() => onCellBlur(row.id)}
              options={members}
              openOnFocus
              autoHighlight
              size="small"
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !acOpenRef.current) {
                      onEnterFromRow(row.id);
                    } else if (e.key === 'Tab' || e.key === 'Escape') {
                      onKeyDown(e, row.id, field);
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    style: inputStyle,
                  }}
                  inputProps={{
                    ...params.inputProps,
                    style: { padding: '2px 0' },
                  }}
                />
              )}
            />
          </TableCell>
        );
      }
      return (
        <TableCell style={{ padding: '4px 8px' }}>
          <InputBase
            value={value}
            onChange={(e) => onCellChange(row.id, field, e.target.value)}
            onBlur={() => onCellBlur(row.id)}
            onKeyDown={(e) => onKeyDown(e, row.id, field)}
            type={type}
            autoFocus
            fullWidth
            style={inputStyle}
            inputRef={inputRef}
          />
        </TableCell>
      );
    }

    let display = value;
    if (type === 'number' && value !== '') display = parseFloat(value).toFixed(2);
    return (
      <TableCell
        style={{ ...cellStyle, color: !display ? '#aaa' : 'inherit' }}
        onClick={() => onCellClick(row.id, field)}
      >
        {display || (isDraft ? '...' : '\u00A0')}
      </TableCell>
    );
  };

  const actuals = computeActualSpends(row.amount, row.splits, members, row.equalSplit);

  return (
    <TableRow
      hover
      style={{ opacity: isDraft ? 0.5 : draggingId === row.id ? 0.4 : 1 }}
      className={dragOverId === row.id ? classes.dragOver : undefined}
      onDragOver={!isDraft ? (e) => { e.preventDefault(); onDragOver(row.id); } : undefined}
      onDrop={!isDraft ? () => onDrop(row.id) : undefined}
    >
      <TableCell
        className={classes.dragHandle}
        draggable={!isDraft}
        onDragStart={!isDraft ? (e) => {
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(row.id);
        } : undefined}
        onDragEnd={onDragEnd}
        style={isDraft ? { color: 'transparent', cursor: 'default' } : undefined}
      >
        <DragIndicatorIcon fontSize="small" />
      </TableCell>
      {renderCell('date', row.date, 'date')}
      {renderCell('vendor', row.vendor)}
      {renderCell('description', row.description)}
      {isMultiCurrency && renderCell('amountLocal', row.amountLocal, 'number')}
      {renderCell('amount', row.amount, 'number')}
      {renderCell('paidBy', row.paidBy)}
      <TableCell
        style={{
          padding: '0 4px',
          textAlign: 'center',
          cursor: 'pointer',
          outline: isEditing('equalSplit') ? '2px solid #1976d2' : 'none',
          outlineOffset: '-2px',
        }}
        onClick={() => onCellClick(row.id, 'equalSplit')}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
            onToggleEqual(row.id);
          } else {
            onKeyDown(e, row.id, 'equalSplit');
          }
        }}
        tabIndex={isEditing('equalSplit') ? 0 : -1}
        ref={isEditing('equalSplit') ? (el) => el && el.focus() : undefined}
      >
        <Checkbox
          size="small"
          checked={row.equalSplit}
          onChange={() => onToggleEqual(row.id)}
          style={{ padding: 2 }}
        />
      </TableCell>
      {members.map(m => renderCell(`split_${m}`, row.splits[m] ?? '', 'number'))}
      <TableCell className={classes.sectionDivider} style={{ padding: '4px 8px', fontWeight: 600 }}>
        {(() => {
          const sum = members.reduce((s, m) => s + (parseFloat(row.splits[m]) || 0), 0);
          return sum ? sum.toFixed(2) : '\u00A0';
        })()}
      </TableCell>
      {members.map((m, i) => (
        <TableCell
          key={`actual_${m}`}
          className={`${classes.actualCell}${i === 0 ? ` ${classes.sectionDivider}` : ''}`}
        >
          {actuals[m] != null ? actuals[m].toFixed(2) : '\u00A0'}
        </TableCell>
      ))}
      <TableCell style={{ padding: '4px 8px', width: 40 }}>
        {!isDraft && (
          <IconButton size="small" onClick={() => onDelete(row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

const ExpenseGrid = ({ members, tripId, currency }) => {
  const classes = useStyles();
  const isMultiCurrency = currency !== 'USD';
  const [rows, setRows] = useState([]);
  const [draftRow, setDraftRow] = useState(() => makeEmptyRow(members));
  const [editingCell, setEditingCell] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const inputRef = useRef(null);
  const draftRef = useRef(draftRow);
  const editingRef = useRef(editingCell);
  const rowsRef = useRef(rows);
  const saveTimersRef = useRef({});

  // Keep refs in sync with state
  draftRef.current = draftRow;
  editingRef.current = editingCell;
  rowsRef.current = rows;

  // Load expenses from backend on mount
  useEffect(() => {
    http.get(`/tripApi/trip/${tripId}/expense`)
      .then(res => {
        const loaded = res.data.map(doc => ({
          id: doc._id,
          date: doc.date ? doc.date.slice(0, 10) : todayStr(),
          vendor: doc.vendor || '',
          description: doc.description || '',
          amountLocal: doc.amountLocal ? String(doc.amountLocal) : '',
          amount: doc.amount ? String(doc.amount) : '',
          paidBy: doc.paidBy || '',
          equalSplit: doc.equalSplit || false,
          splits: members.reduce((acc, m) => {
            const val = doc.splits && doc.splits[m];
            acc[m] = val != null ? String(val) : '';
            return acc;
          }, {}),
        }));
        setRows(loaded);
      })
      .catch(() => setSaveError('Failed to load expenses.'));
  }, [tripId, members]);

  const baseFields = useMemo(() => isMultiCurrency
    ? ['date', 'vendor', 'description', 'amountLocal', 'amount', 'paidBy', 'equalSplit']
    : ['date', 'vendor', 'description', 'amount', 'paidBy', 'equalSplit'],
  [isMultiCurrency]);
  const fullFieldOrder = useMemo(
    () => [...baseFields, ...members.map(m => `split_${m}`)],
    [baseFields, members]
  );

  const getFieldOrder = useCallback((rowId) => {
    const row = rowId === draftRef.current.id
      ? draftRef.current
      : rowsRef.current.find(r => r.id === rowId);
    if (row && row.equalSplit) return baseFields;
    return fullFieldOrder;
  }, [baseFields, fullFieldOrder]);

  const saveRow = useCallback((rowId) => {
    if (typeof rowId !== 'string') return; // not yet persisted
    const row = rowsRef.current.find(r => r.id === rowId);
    if (!row) return;
    http.put(`/tripApi/trip/${tripId}/expense/${rowId}`, rowToPayload(row))
      .catch(() => setSaveError('Failed to save expense.'));
  }, [tripId]);

  const debouncedSave = useCallback((rowId) => {
    if (typeof rowId !== 'string') return;
    if (saveTimersRef.current[rowId]) clearTimeout(saveTimersRef.current[rowId]);
    saveTimersRef.current[rowId] = setTimeout(() => {
      saveRow(rowId);
      delete saveTimersRef.current[rowId];
    }, 500);
  }, [saveRow]);

  const handleCellClick = useCallback((rowId, field) => {
    setEditingCell({ rowId, field });
  }, []);

  const handleCellChange = useCallback((rowId, field, value) => {
    const update = (row) => {
      if (field === 'amount' || field === 'amountLocal') {
        return { ...row, [field]: value };
      }
      if (field.startsWith('split_')) {
        const member = field.replace('split_', '');
        return { ...row, splits: { ...row.splits, [member]: value } };
      }
      return { ...row, [field]: value };
    };

    setDraftRow(prev => {
      if (rowId === prev.id) return update(prev);
      return prev;
    });
    setRows(prev => prev.map(r => r.id === rowId ? update(r) : r));
    debouncedSave(rowId);
  }, [debouncedSave]);

  const handleToggleEqual = useCallback((rowId) => {
    const toggle = (row) => {
      const next = !row.equalSplit;
      if (next) {
        const empty = members.reduce((acc, m) => ({ ...acc, [m]: '' }), {});
        return { ...row, equalSplit: true, splits: empty };
      }
      return { ...row, equalSplit: false };
    };
    setDraftRow(prev => (prev.id === rowId ? toggle(prev) : prev));
    setRows(prev => prev.map(r => r.id === rowId ? toggle(r) : r));
    // Immediate save for committed rows (setTimeout 0 to read latest state)
    if (typeof rowId === 'string') {
      setTimeout(() => saveRow(rowId), 0);
    }
  }, [members, saveRow]);

  const promoteDraft = useCallback(() => {
    const d = draftRef.current;
    const hasContent = d.description || d.amount || d.paidBy || d.vendor;
    if (hasContent) {
      const localId = d.id;
      setRows(prev => {
        if (prev.some(r => r.id === d.id)) return prev;
        return [...prev, d];
      });
      // POST to backend
      http.post(`/tripApi/trip/${tripId}/expense`, rowToPayload(d))
        .then(res => {
          // Replace local numeric id with MongoDB _id
          setRows(prev => prev.map(r => r.id === localId ? { ...r, id: res.data._id } : r));
        })
        .catch(() => setSaveError('Failed to create expense.'));
      const newDraft = makeEmptyRow(members);
      draftRef.current = newDraft;
      setDraftRow(newDraft);
    }
  }, [members, tripId]);

  const handleCellBlur = useCallback((rowId) => {
    const atBlurTime = editingRef.current;
    setTimeout(() => {
      const current = editingRef.current;
      if (current && atBlurTime
        && current.rowId === atBlurTime.rowId
        && current.field === atBlurTime.field) {
        setEditingCell(null);
        if (rowId === draftRef.current.id) {
          promoteDraft();
        }
      }
    }, 100);
  }, [promoteDraft]);

  const handleEnterFromRow = useCallback((rowId) => {
    if (rowId === draftRef.current.id) {
      promoteDraft();
      setTimeout(() => {
        setEditingCell({ rowId: draftRef.current.id, field: 'date' });
      }, 0);
    } else {
      const currentRows = rowsRef.current;
      const idx = currentRows.findIndex(r => r.id === rowId);
      if (idx < currentRows.length - 1) {
        setEditingCell({ rowId: currentRows[idx + 1].id, field: 'date' });
      } else {
        setEditingCell({ rowId: draftRef.current.id, field: 'date' });
      }
    }
  }, [promoteDraft]);

  const handleKeyDown = useCallback((e, rowId, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterFromRow(rowId);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const fields = getFieldOrder(rowId);
      const idx = fields.indexOf(field);
      const allRowIds = [...rowsRef.current.map(r => r.id), draftRef.current.id];
      const rowIdx = allRowIds.indexOf(rowId);

      if (e.shiftKey) {
        if (idx > 0) {
          setEditingCell({ rowId, field: fields[idx - 1] });
        } else if (rowIdx > 0) {
          const prevId = allRowIds[rowIdx - 1];
          const prevFields = getFieldOrder(prevId);
          setEditingCell({ rowId: prevId, field: prevFields[prevFields.length - 1] });
        }
      } else {
        if (idx < fields.length - 1) {
          setEditingCell({ rowId, field: fields[idx + 1] });
        } else {
          if (rowId === draftRef.current.id) {
            promoteDraft();
            setTimeout(() => {
              setEditingCell({ rowId: draftRef.current.id, field: 'date' });
            }, 0);
          } else if (rowIdx < allRowIds.length - 1) {
            setEditingCell({ rowId: allRowIds[rowIdx + 1], field: 'date' });
          }
        }
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }, [getFieldOrder, promoteDraft, handleEnterFromRow]);

  const handleDelete = useCallback((rowId) => {
    setRows(prev => prev.filter(r => r.id !== rowId));
    if (typeof rowId === 'string') {
      http.delete(`/tripApi/trip/${tripId}/expense/${rowId}`)
        .catch(() => setSaveError('Failed to delete expense.'));
    }
  }, [tripId]);

  const handleDragStart = useCallback((rowId) => {
    setDraggingId(rowId);
  }, []);

  const handleDragOver = useCallback((rowId) => {
    setDragOverId(rowId);
  }, []);

  const handleDrop = useCallback((targetId) => {
    const fromId = draggingId;
    setDraggingId(null);
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;
    setRows(prev => {
      const fromIdx = prev.findIndex(r => r.id === fromId);
      const toIdx = prev.findIndex(r => r.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      // Persist new order
      const orderedIds = next.filter(r => typeof r.id === 'string').map(r => r.id);
      if (orderedIds.length > 0) {
        http.put(`/tripApi/trip/${tripId}/expense/reorder`, { orderedIds })
          .catch(() => setSaveError('Failed to save row order.'));
      }
      return next;
    });
  }, [draggingId, tripId]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  return (
    <Paper style={{ marginTop: 24, paddingBottom: 200 }}>
      <Typography variant="subtitle1" style={{ fontWeight: 600, padding: '16px 16px 8px' }}>
        Expenses
      </Typography>
      {saveError && (
        <Alert severity="error" style={{ margin: '0 16px 8px' }} onClose={() => setSaveError('')}>
          {saveError}
        </Alert>
      )}
      <TableContainer>
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} style={{ width: 30 }} />
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 100 }}>Date</TableCell>
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 160 }}>Vendor</TableCell>
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 200 }}>Description</TableCell>
              {isMultiCurrency && (
                <TableCell rowSpan={2} style={{ fontWeight: 600, width: 70 }}>{currency} Amt</TableCell>
              )}
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 70 }}>
                {isMultiCurrency ? 'USD Amt' : 'Amount'}
              </TableCell>
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 88 }}>Paid By</TableCell>
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 75, textAlign: 'center' }}>Equal Split</TableCell>
              <TableCell
                colSpan={members.length}
                align="center"
                style={{ fontWeight: 600, padding: '4px 8px', borderBottom: 'none' }}
              >
                Split Ratios
              </TableCell>
              <TableCell
                rowSpan={2}
                className={classes.sectionDivider}
                style={{ fontWeight: 600, width: 55, padding: '4px 8px' }}
              >
                Subtotal
              </TableCell>
              <TableCell
                colSpan={members.length}
                align="center"
                className={`${classes.actualCell} ${classes.sectionDivider}`}
                style={{ fontWeight: 600, padding: '4px 8px', borderBottom: 'none' }}
              >
                Actual Spend
              </TableCell>
              <TableCell rowSpan={2} style={{ width: 40 }} />
            </TableRow>
            <TableRow>
              {members.map(m => (
                <TableCell key={m} style={{ fontWeight: 600, width: 45, paddingTop: 0 }}>{m}</TableCell>
              ))}
              {members.map((m, i) => (
                <TableCell
                  key={`actual_${m}`}
                  className={`${classes.actualCell}${i === 0 ? ` ${classes.sectionDivider}` : ''}`}
                  style={{ fontWeight: 600, width: 45, paddingTop: 0 }}
                >
                  {m}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <ExpenseRow
                key={row.id}
                row={row}
                isDraft={false}
                members={members}
                isMultiCurrency={isMultiCurrency}
                editingCell={editingCell}
                onCellClick={handleCellClick}
                onCellChange={handleCellChange}
                onCellBlur={handleCellBlur}
                onKeyDown={handleKeyDown}
                onDelete={handleDelete}
                onEnterFromRow={handleEnterFromRow}
                onToggleEqual={handleToggleEqual}
                inputRef={inputRef}
                classes={classes}
                draggingId={draggingId}
                dragOverId={dragOverId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            ))}
            <ExpenseRow
              key={draftRow.id}
              row={draftRow}
              isDraft={true}
              members={members}
              isMultiCurrency={isMultiCurrency}
              editingCell={editingCell}
              onCellClick={handleCellClick}
              onCellChange={handleCellChange}
              onCellBlur={handleCellBlur}
              onKeyDown={handleKeyDown}
              onDelete={handleDelete}
              onEnterFromRow={handleEnterFromRow}
              onToggleEqual={handleToggleEqual}
              inputRef={inputRef}
              classes={classes}
              draggingId={draggingId}
              dragOverId={dragOverId}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > 0 && (() => {
        const settlements = computeSettlements(rows, members);
        return (
          <Box style={{ padding: '16px 16px 0' }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
              Settlement
            </Typography>
            {settlements.length === 0 ? (
              <Typography variant="body2" color="textSecondary">All settled up!</Typography>
            ) : (
              settlements.map((s, i) => (
                <Typography key={i} variant="body2" style={{ marginBottom: 4 }}>
                  <strong>{s.from}</strong> owes <strong>{s.to}</strong> ${s.amount.toFixed(2)}
                </Typography>
              ))
            )}
          </Box>
        );
      })()}
    </Paper>
  );
};

export default ExpenseGrid;
