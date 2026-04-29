import React, { useState, useRef, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputBase, IconButton, Typography, makeStyles, TextField, Checkbox
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import DeleteIcon from '@material-ui/icons/Delete';

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
});

let nextId = 1;

const makeEmptyRow = (members) => ({
  id: nextId++,
  description: '',
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

const ExpenseRow = ({ row, isDraft, members, editingCell, onCellClick, onCellChange, onCellBlur, onKeyDown, onEnterFromRow, onDelete, onToggleEqual, inputRef, classes }) => {
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

    const display = type === 'number' && value !== '' ? parseFloat(value).toFixed(2) : value;
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
    <TableRow hover style={{ opacity: isDraft ? 0.5 : 1 }}>
      {renderCell('description', row.description)}
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

const ExpenseGrid = ({ members }) => {
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [draftRow, setDraftRow] = useState(() => makeEmptyRow(members));
  const [editingCell, setEditingCell] = useState(null);
  const inputRef = useRef(null);
  const draftRef = useRef(draftRow);
  const editingRef = useRef(editingCell);
  const rowsRef = useRef(rows);

  // Keep refs in sync with state
  draftRef.current = draftRow;
  editingRef.current = editingCell;
  rowsRef.current = rows;

  const baseFields = ['description', 'amount', 'paidBy', 'equalSplit'];
  const splitFields = members.map(m => `split_${m}`);
  const fullFieldOrder = [...baseFields, ...splitFields];

  const getFieldOrder = useCallback((rowId) => {
    const row = rowId === draftRef.current.id
      ? draftRef.current
      : rowsRef.current.find(r => r.id === rowId);
    if (row && row.equalSplit) return baseFields;
    return fullFieldOrder;
  }, [baseFields, fullFieldOrder]);

  const handleCellClick = useCallback((rowId, field) => {
    setEditingCell({ rowId, field });
  }, []);

  const handleCellChange = useCallback((rowId, field, value) => {
    const update = (row) => {
      if (field === 'amount') {
        return { ...row, amount: value };
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
  }, [members]);

  const handleToggleEqual = useCallback((rowId) => {
    const toggle = (row) => {
      const next = !row.equalSplit;
      console.log(`[ExpenseGrid] toggleEqual rowId=${rowId} equalSplit: ${row.equalSplit} → ${next}`);
      if (next) {
        const empty = members.reduce((acc, m) => ({ ...acc, [m]: '' }), {});
        return { ...row, equalSplit: true, splits: empty };
      }
      return { ...row, equalSplit: false };
    };
    setDraftRow(prev => (prev.id === rowId ? toggle(prev) : prev));
    setRows(prev => prev.map(r => r.id === rowId ? toggle(r) : r));
  }, [members]);

  const promoteDraft = useCallback(() => {
    const d = draftRef.current;
    const hasContent = d.description || d.amount || d.paidBy;
    if (hasContent) {
      setRows(prev => {
        // Guard against double-promotion
        if (prev.some(r => r.id === d.id)) return prev;
        return [...prev, d];
      });
      const newDraft = makeEmptyRow(members);
      draftRef.current = newDraft;
      setDraftRow(newDraft);
    }
  }, [members]);

  const handleCellBlur = useCallback((rowId) => {
    // Snapshot what was being edited at blur time
    const atBlurTime = editingRef.current;
    // Small delay to allow focus to move to the next cell via Tab/click
    setTimeout(() => {
      const current = editingRef.current;
      // Only clear if editingCell hasn't changed since blur (focus truly left the grid)
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
        // Shift+Tab — move left, wrap to previous row's last field
        if (idx > 0) {
          setEditingCell({ rowId, field: fields[idx - 1] });
        } else if (rowIdx > 0) {
          const prevId = allRowIds[rowIdx - 1];
          const prevFields = getFieldOrder(prevId);
          setEditingCell({ rowId: prevId, field: prevFields[prevFields.length - 1] });
        }
      } else {
        // Tab — move right, wrap to next row's first field
        if (idx < fields.length - 1) {
          setEditingCell({ rowId, field: fields[idx + 1] });
        } else {
          // Last field in row — advance to next row's description
          if (rowId === draftRef.current.id) {
            promoteDraft();
            setTimeout(() => {
              setEditingCell({ rowId: draftRef.current.id, field: 'description' });
            }, 0);
          } else if (rowIdx < allRowIds.length - 1) {
            setEditingCell({ rowId: allRowIds[rowIdx + 1], field: 'description' });
          }
        }
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }, [getFieldOrder, promoteDraft]);

  const handleEnterFromRow = useCallback((rowId) => {
    if (rowId === draftRef.current.id) {
      promoteDraft();
      setTimeout(() => {
        setEditingCell({ rowId: draftRef.current.id, field: 'description' });
      }, 0);
    } else {
      const currentRows = rowsRef.current;
      const idx = currentRows.findIndex(r => r.id === rowId);
      if (idx < currentRows.length - 1) {
        setEditingCell({ rowId: currentRows[idx + 1].id, field: 'description' });
      } else {
        setEditingCell({ rowId: draftRef.current.id, field: 'description' });
      }
    }
  }, [promoteDraft]);

  const handleDelete = useCallback((rowId) => {
    setRows(prev => prev.filter(r => r.id !== rowId));
  }, []);

  return (
    <Paper style={{ marginTop: 24 }}>
      <Typography variant="subtitle1" style={{ fontWeight: 600, padding: '16px 16px 8px' }}>
        Expenses
      </Typography>
      <TableContainer>
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} style={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 100 }}>Amount</TableCell>
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 110 }}>Paid By</TableCell>
              <TableCell rowSpan={2} style={{ fontWeight: 600, width: 60, textAlign: 'center' }}>Equal?</TableCell>
              <TableCell
                colSpan={members.length}
                align="center"
                style={{ fontWeight: 600, padding: '4px 8px', borderBottom: 'none' }}
              >
                Split Ratios
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
                <TableCell key={m} style={{ fontWeight: 600, width: 90, paddingTop: 0 }}>{m}</TableCell>
              ))}
              {members.map((m, i) => (
                <TableCell
                  key={`actual_${m}`}
                  className={`${classes.actualCell}${i === 0 ? ` ${classes.sectionDivider}` : ''}`}
                  style={{ fontWeight: 600, width: 90, paddingTop: 0 }}
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
              />
            ))}
            <ExpenseRow
              key={draftRow.id}
              row={draftRow}
              isDraft={true}
              members={members}
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
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ExpenseGrid;
