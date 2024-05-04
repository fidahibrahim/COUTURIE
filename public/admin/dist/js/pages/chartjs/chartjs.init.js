$(function () {
    "use strict";

	
// ===============================MY MONTHLY============================

// SALES
let jan = document.getElementById("Jan").value
let feb = document.getElementById("Feb").value
let mar = document.getElementById("March").value
let apr = document.getElementById("April").value
let may = document.getElementById("May").value
let jun = document.getElementById("June").value
let jul = document.getElementById("July").value
let aug = document.getElementById("Aug").value
let sep = document.getElementById("Sep").value
let oct = document.getElementById("Oct").value
let nov = document.getElementById("Nov").value
let dec = document.getElementById("Dec").value


// orders

let JanOrders = document.getElementById('jan').value
let FebOrders = document.getElementById('feb').value
let MarOrders = document.getElementById('march').value
let AprOrders = document.getElementById('april').value
let MayOrders = document.getElementById('may').value
let JunOrders = document.getElementById('june').value
let JulOrders = document.getElementById('july').value
let AugOrders = document.getElementById('aug').value
let SepOrders = document.getElementById('sep').value
let OctOrders = document.getElementById('oct').value
let NovOrders = document.getElementById('nov').value
let DecOrders = document.getElementById('dec').value



// users

let JAN = document.getElementById('JAN').value
let FEB = document.getElementById('FEB').value
let MAR = document.getElementById('MAR').value
let APR = document.getElementById('APR').value
let MAY = document.getElementById('MAY').value
let JUN = document.getElementById('JUN').value
let JUL = document.getElementById('JUL').value
let AUG = document.getElementById('AUG').value
let SEP = document.getElementById('SEP').value
let OCT = document.getElementById('OCT').value
let NOV = document.getElementById('NOV').value
let DEC = document.getElementById('DEC').value

console.log("month",AprOrders,MarOrders);

	new Chart(document.getElementById("line-chart"), {
		type: 'bar',
		data: {
		  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov','Dec'],
		  datasets: [{ 
			data: [jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec],
			label: "sales",
			backgroundColor: "#5f76e8", 
			fill: false
		  }, { 
			data: [JanOrders,FebOrders,MarOrders,AprOrders,MayOrders,JunOrders,JulOrders,AugOrders,SepOrders,OctOrders,NovOrders,DecOrders],
			label: "orders",
			backgroundColor: "#02cccd", 
			fill: false
		  }, { 
			data: [JAN,FEB,MAR,APR,MAY,JUN,JUL,AUG,SEP,OCT,NOV,DEC],
			label: "users",
			backgroundColor: "#7057d2", 
			fill: false
		  }, 
		]
		},
		options: {
		  title: {
			display: true,
			text: 'Monthly sale,order,client statistics'
		}
		}
	});


	// ========================= YEARLY====================================

	//sales

	let sales19 = document.getElementById('2019').value
	let sales20 = document.getElementById('2020').value
	let sales21 = document.getElementById('2021').value
	let sales22 = document.getElementById('2022').value
	let sales23 = document.getElementById('2023').value
	let sales24 = document.getElementById('2024').value

	//orders

	let orders19 = document.getElementById('order2019').value
	let orders20 = document.getElementById('order2020').value
	let orders21 = document.getElementById('order2021').value
	let orders22 = document.getElementById('order2022').value
	let orders23 = document.getElementById('order2023').value
	let orders24 = document.getElementById('order2024').value

	//users

	let users19 = document.getElementById('users2019').value
	let users20 = document.getElementById('users2020').value
	let users21 = document.getElementById('users2021').value
	let users22 = document.getElementById('users2022').value
	let users23 = document.getElementById('users2023').value
	let users24 = document.getElementById('users2024').value
	

console.log('data',users24,orders24);
	new Chart(document.getElementById("line-chart1"), {
		type: 'bar',
		data: {
		  labels: ['2019', '2020', '2021', '2022', '2023', '2024','2025','2026','2027' ],
		  datasets: [{ 
			data: [ sales19,sales20,sales21,sales22,sales23,sales24 ],
			label: "sales",
			backgroundColor: "#5f76e8", 
			fill: false
		  }, { 
			data: [ orders19,orders20,orders21,orders22,orders23,orders24 ],
			label: "orders",
			backgroundColor: "#02cccd", 
			fill: false
		  }, { 
			data: [ users19,users20,users21,users22,users23,users24 ],
			label: "users",
			backgroundColor: "#7057d2", 
			fill: false
		  }, 
		]
		},
		options: {
		  title: {
			display: true,
			text: 'Yearly sale,order,client statistics'
		}
		}
	});

	
}); 