import React, {Component} from 'react';
import AnnualCategoryTable from './AnnualCategoryTable'

class AnalysisHome extends Component {
  render() {
    let {incomeCategories, expenseCategories, year} = this.props

    return (
      <div className="analysis">
        <AnnualCategoryTable
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          year={year}
        />
      </div>
    );
  }
}
export default AnalysisHome;
