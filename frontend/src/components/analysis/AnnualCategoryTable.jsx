import React, {Component} from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';

class AnnualCategoryTable extends Component {

  // props: expenseCategories, incomeCategories
  state = {
  }

  render() {

    let {incomeCategories, expenseCategories} = this.props;

    let year = this.props.year;
    let renderedIncomeCategories = incomeCategories.map(category => TableCategoryRow(category, year));
    let renderedExpenseCategories = expenseCategories.map(category => TableCategoryRow(category, year));

    return <TableContainer>
      <Table size="small">
        <TableHead>
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
