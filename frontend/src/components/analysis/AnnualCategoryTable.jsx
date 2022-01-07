import React, {Component} from 'react';

class AnnualCategoryTable extends Component {

  // props: expenseCategories, incomeCategories
  state = {
  }

  render() {

    let {incomeCategories, expenseCategories} = this.props;

    let year = this.props.year;
    let renderedIncomeCategories = incomeCategories.map(category =>TableCategoryRow(category,year));

    let renderedExpenseCategories = expenseCategories.map(category =>TableCategoryRow(category,year));


    return <div>
      <table>
        <tbody>
          {TableHeader()}
          {renderedIncomeCategories}
          <tr><br/></tr>
          {renderedExpenseCategories}
        </tbody>
      </table>
    </div>
  }
}

function TableHeader() {
  return <tr>
    <td className="monthCategoryCell">Category</td>
    <td className="monthBudgetCell">Budget</td>
    <td className="monthBudgetCell">Jan</td>
    <td className="monthBudgetCell">Feb</td>
    <td className="monthBudgetCell">Mar</td>
    <td className="monthBudgetCell">Apr</td>
    <td className="monthBudgetCell">May</td>
    <td className="monthBudgetCell">Jun</td>
    <td className="monthBudgetCell">Jul</td>
    <td className="monthBudgetCell">Aug</td>
    <td className="monthBudgetCell">Sep</td>
    <td className="monthBudgetCell">Oct</td>
    <td className="monthBudgetCell">Nov</td>
    <td className="monthBudgetCell">Dec</td>
    <td className="monthBudgetCell">Total</td>
  </tr>
}


function TableCategoryRow(category, year) {
  const monthlySpend = category.monthlySpend;
  let months = [];
  let multiplier = category.categoryType === "Income" ? -1 : 1
  if (category.monthlyBudgetSingular != -1) {
    months.push(<td className="monthBudgetCell">${category.monthlyBudgetSingular}</td>)
  }
  else {
    months.push(<td className="monthBudgetCell"></td>)
  }
  for (let i = 0; i < 12; i++) {
    if (!!monthlySpend[year]) {
      months.push(<td className="monthBudgetCell">${multiplier*category.monthlySpend[year][i]}</td>)
    }
    else {
      // choose not to show line if there are no txns
      //return ""
      months.push(<td className="monthBudgetCell">$0</td>)
    }
  }

  return <tr>
    <td className="monthCategoryCell">{category.categoryName}</td>
    {months}
  </tr>
}




export default AnnualCategoryTable;
