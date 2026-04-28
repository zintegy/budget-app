import React, {Component} from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';

class AnnualCategoryTable extends Component {

  // props: expenseCategories, incomeCategories
  state = {
    tooltip: null, // { x, y, text }
  }

  render() {

    let {incomeCategories, expenseCategories} = this.props;

    let year = this.props.year;
    let renderedIncomeCategories = incomeCategories.map(category => TableCategoryRow(category, year));
    let renderedExpenseCategories = expenseCategories.map(category => TableCategoryRow(category, year));

    const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    let income = Array(12).fill(0);
    let totalExpense = Array(12).fill(0);
    let houseAndTax = Array(12).fill(0);
    let typicalExpense = Array(12).fill(0);

    for (let i = 0; i < 12; i++) {
      incomeCategories.forEach(category => {
        if (!!category['monthlySpend'][year]) {
          income[i] -= category['monthlySpend'][year][i]
        }
      })
      expenseCategories.forEach(category => {
        if (!!category['monthlySpend'][year]) {
          totalExpense[i] += category['monthlySpend'][year][i]
          if (category['categoryName'] !== 'House' && category['categoryName'] !== 'Government/Tax') {
            typicalExpense[i] += category['monthlySpend'][year][i]
          } else {
            houseAndTax[i] += category['monthlySpend'][year][i]
          }
        }
      })
    }

    const datasets = [
      { label: "Income", data: income, color: 'rgb(255, 99, 132)' },
      { label: "Total Expense", data: totalExpense, color: 'rgb(54, 162, 235)' },
      { label: "Regular Expense", data: typicalExpense, color: 'rgb(240, 240, 130)' },
      { label: "House and Tax", data: houseAndTax, color: 'rgb(54, 235, 162)' },
    ];

    const allValues = datasets.flatMap(ds => ds.data);
    const rawMax = Math.max(...allValues, 1);
    const rawMin = Math.min(...allValues, 0);
    const padding = 10;
    const svgHeight = 320;
    const plotHeight = svgHeight - padding * 2;

    // Generate nice y-axis ticks
    function niceStep(range, targetCount) {
      if (range === 0) return 1;
      const rough = range / targetCount;
      const pow = Math.pow(10, Math.floor(Math.log10(rough)));
      const n = rough / pow;
      const step = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
      return step * pow;
    }
    const step = niceStep(rawMax - rawMin, 5);
    const tickMin = Math.floor(rawMin / step) * step;
    const tickMax = Math.ceil(rawMax / step) * step;
    const ticks = [];
    for (let v = tickMin; v <= tickMax; v += step) {
      ticks.push(Math.round(v * 100) / 100);
    }

    function yPos(val) {
      return padding + plotHeight * (1 - (val - tickMin) / (tickMax - tickMin || 1));
    }
    function xPct(i) {
      return ((i + 0.5) / 12 * 100) + '%';
    }
    function formatTick(v) {
      if (Math.abs(v) >= 1000) return '$' + (v / 1000) + 'k';
      return '$' + v;
    }

    return <TableContainer>
      <Table size="small" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 200 }} />
          <col style={{ width: 70 }} />
          {labels.map((_, i) => <col key={i} />)}
          <col style={{ width: 70 }} />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} style={{ border: 'none', padding: 0 }}>
              <div style={{ position: 'relative', height: svgHeight }}>
                <div style={{ padding: '4px 8px' }}>
                  {datasets.map(ds => (
                    <div key={ds.label} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ display: 'inline-block', width: 12, height: 3, backgroundColor: ds.color }} />
                      {ds.label}
                    </div>
                  ))}
                </div>
                {ticks.map(v => (
                  <div key={v} style={{
                    position: 'absolute', right: 4, top: yPos(v),
                    transform: 'translateY(-50%)',
                    fontSize: 10, color: '#888',
                  }}>
                    {formatTick(v)}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell colSpan={12} style={{ padding: 0, border: 'none', position: 'relative' }}>
              <svg width="100%" height={svgHeight} style={{ display: 'block' }}
                onMouseLeave={() => this.setState({ tooltip: null })}>
                {/* Horizontal gridlines */}
                {ticks.map(v => (
                  <line key={`grid-h-${v}`}
                    x1="0" y1={yPos(v)} x2="100%" y2={yPos(v)}
                    stroke="#e0e0e0" strokeWidth={1}
                    strokeDasharray={v === 0 ? "none" : "4,4"}
                  />
                ))}
                {/* Vertical gridlines at month centers */}
                {labels.map((_, i) => (
                  <line key={`grid-v-${i}`}
                    x1={xPct(i)} y1={padding} x2={xPct(i)} y2={svgHeight - padding}
                    stroke="#f0f0f0" strokeWidth={1}
                  />
                ))}
                {/* Data lines and dots */}
                {datasets.map(ds => (
                  <g key={ds.label}>
                    {ds.data.map((v, i) => i < 11 ? (
                      <line key={`l${i}`}
                        x1={xPct(i)} y1={yPos(v)}
                        x2={xPct(i + 1)} y2={yPos(ds.data[i + 1])}
                        stroke={ds.color} strokeWidth={2}
                      />
                    ) : null)}
                    {ds.data.map((v, i) => (
                      <circle key={i} cx={xPct(i)} cy={yPos(v)} r={4} fill={ds.color}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                          const cx = e.currentTarget.getBoundingClientRect();
                          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                          const lines = datasets.map(d => ({
                            label: d.label,
                            value: d.data[i],
                            color: d.color,
                          }));
                          this.setState({
                            tooltip: {
                              x: cx.left + cx.width / 2 - rect.left,
                              y: yPos(v) - 10,
                              month: monthNames[i],
                              lines,
                              hoveredLabel: ds.label,
                            }
                          });
                        }}
                        onMouseLeave={() => this.setState({ tooltip: null })}
                      />
                    ))}
                  </g>
                ))}
              </svg>
              {this.state.tooltip && (
                <div style={{
                  position: 'absolute',
                  left: this.state.tooltip.x,
                  top: this.state.tooltip.y,
                  transform: 'translate(-50%, -100%)',
                  background: 'rgba(0,0,0,0.85)',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: 4,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{this.state.tooltip.month}</div>
                  {this.state.tooltip.lines.map(l => {
                    const isHovered = l.label === this.state.tooltip.hoveredLabel;
                    return <div key={l.label} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontWeight: isHovered ? 'bold' : 'normal',
                      fontSize: isHovered ? 13 : 11,
                      opacity: isHovered ? 1 : 0.6,
                    }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: l.color }} />
                      {isHovered ? '\u25B6 ' : ''}{l.label}: ${l.value}
                    </div>
                  })}
                </div>
              )}
            </TableCell>
            <TableCell style={{ border: 'none' }} />
          </TableRow>
          <TableRow>
            <TableCell className="monthCategoryCell">Category</TableCell>
            <TableCell className="monthBudgetCell">Budget</TableCell>
            <TableCell className="monthBudgetCell">Jan</TableCell>
            <TableCell className="monthBudgetCell">Feb</TableCell>
            <TableCell className="monthBudgetCell">Mar</TableCell>
            <TableCell className="monthBudgetCell">Apr</TableCell>
            <TableCell className="monthBudgetCell">May</TableCell>
            <TableCell className="monthBudgetCell">Jun</TableCell>
            <TableCell className="monthBudgetCell">Jul</TableCell>
            <TableCell className="monthBudgetCell">Aug</TableCell>
            <TableCell className="monthBudgetCell">Sep</TableCell>
            <TableCell className="monthBudgetCell">Oct</TableCell>
            <TableCell className="monthBudgetCell">Nov</TableCell>
            <TableCell className="monthBudgetCell">Dec</TableCell>
            <TableCell className="monthBudgetCell">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderedIncomeCategories}
          <TableRow><TableCell colSpan={15} style={{ border: 'none', height: 16 }} /></TableRow>
          {renderedExpenseCategories}
        </TableBody>
      </Table>
    </TableContainer>
  }
}


function TableCategoryRow(category, year) {
  const monthlySpend = category.monthlySpend;
  let months = [];
  let multiplier = category.categoryType === "Income" ? -1 : 1
  if (category.monthlyBudgetSingular !== -1) {
    months.push(<TableCell key="budget" className="monthBudgetCell">${category.monthlyBudgetSingular}</TableCell>)
  }
  else {
    months.push(<TableCell key="budget" className="monthBudgetCell"></TableCell>)
  }
  for (let i = 0; i < 12; i++) {
    if (!!monthlySpend[year]) {
      months.push(<TableCell key={i} className="monthBudgetCell">${multiplier*category.monthlySpend[year][i]}</TableCell>)
    }
    else {
      // choose not to show line if there are no txns
      //return ""
      months.push(<TableCell key={i} className="monthBudgetCell">$0</TableCell>)
    }
  }

  return <TableRow key={category._id} hover>
    <TableCell className="monthCategoryCell">{category.categoryName}</TableCell>
    {months}
  </TableRow>
}




export default AnnualCategoryTable;
