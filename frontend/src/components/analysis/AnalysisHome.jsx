import React, {Component} from 'react';
import AnnualCategoryTable from './AnnualCategoryTable'
import AnnualCategoryGraphs from './AnnualCategoryGraphs'
/*import axios from 'axios';*/

class AnalysisHome extends Component {
  render() {
    let {incomeCategories, expenseCategories, year} = this.props

    return (
      <div className="analysis">
        {AnnualCategoryGraphs(incomeCategories, expenseCategories, year)}
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
