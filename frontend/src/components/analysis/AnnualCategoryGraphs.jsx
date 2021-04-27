import React from 'react';
import { Line } from 'react-chartjs-2';

export default function AnnualCategoryGraphs(incomeCategories, expenseCategories, year) {

  const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  let income = Array(12).fill(0);
  let expense = Array(12).fill(0);


  for (let i = 0; i < 12; i++) {
    incomeCategories.forEach(category => {
      if (!!category['monthlySpend'][year]) {
        income[i] -= category['monthlySpend'][year][i]
      }
    })

    expenseCategories.forEach(category => {
      if (!!category['monthlySpend'][year]) {
        expense[i] += category['monthlySpend'][year][i]
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
        label: "Expense",
        data: expense,
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: 'rgba(54, 162, 235, 0.2)',
      },
    ]
  }

  let options = {}


  return <div>
    <Line data={data} options={options} />
  </div>
}


