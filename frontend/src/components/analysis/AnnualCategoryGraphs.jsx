import React from 'react';
import { Line } from 'react-chartjs-2';
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

export default function AnnualCategoryGraphs(incomeCategories, expenseCategories, year) {

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
        }
        else {
          houseAndTax[i] += category['monthlySpend'][year][i]
        }
      }
    })
  }


  let data = {
    labels,
    datasets: [
      {
        label: "Income",
        data: income,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        label: "Total Expense",
        data: totalExpense,
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: "Regular Expense",
        data: typicalExpense,
        backgroundColor: 'rgb(240, 240, 130)',
        borderColor: 'rgba(200, 200, 130, 0.2)',
      },
      {
        label: "House and Tax",
        data: houseAndTax,
        backgroundColor: 'rgb(54, 235, 162)',
        borderColor: 'rgba(54, 235, 162, 0.2)',
      },

    ]
  }

  let options = {}


  return <div>
    <Line data={data} options={options} />
  </div>
}


