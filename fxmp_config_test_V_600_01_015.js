/* run next then create encode account information for you (need change your ID and PWD in test_base64 first):
   node fxmp.js -cmd base64
 */
cfg_orderinfo = {
	pair: 'USD/JPY',
	pairamount: 100,
	maxbalnceamount: 600 * 100, //买和卖抵消后绝对值数量
	maxtotalamount: 610 * 100, //买和卖简单合计数量
	minremain: 200000, //最少剩余余额，少于这个交易停止
	pricerang: [ //当价格处于定义范围之外或act为空时停止交易
	             //当act为gain时停止新规，只按gspace处理有利益的记录
		//范围开始，结束，动作(sell/buy/auto/gain)，价格间隔，利益间隔
		//当act为auto时自动根据买或卖数量来平衡
		{min:90, max:102, act:'buy', amount:600, pspace:0.1, gspace: 0.1501},
		{min:102, max:104, act:'buy', amount:500, pspace:0.1, gspace: 0.1501},
		{min:102, max:104, act:'sell', amount:100, pspace:0.1, gspace: 0.1501},
		{min:104, max:106, act:'buy', amount:400, pspace:0.1, gspace: 0.1501},
		{min:104, max:106, act:'sell', amount:200, pspace:0.1, gspace: 0.1501},
		{min:106, max:112, act:'sellbuy', amount:300, pspace:0.1, gspace: 0.1501},
		{min:112, max:114, act:'buy', amount:200, pspace:0.1, gspace: 0.1501},
		{min:112, max:114, act:'sell', amount:400, pspace:0.1, gspace: 0.1501},
		{min:114, max:116, act:'buy', amount:100, pspace:0.1, gspace: 0.1501},
		{min:114, max:116, act:'sell', amount:500, pspace:0.1, gspace: 0.1501},
		{min:116, max:130, act:'sell', amount:600, pspace:0.1, gspace: 0.1501},
		]
};


cfg_testarr = [
	{pspace:0.05, gspace: 0.4001, amount:100, act: 'sellbuy'},
	{pspace:0.05, gspace: 0.3001},
	{pspace:0.05, gspace: 0.2001},
	{pspace:0.05, gspace: 0.15001},
	{pspace:0.05, gspace: 0.1001},
	{pspace:0.05, gspace: 0.05001},
	{pspace:0.05, gspace: 0.04001},
	{pspace:0.05, gspace: 0.03001},

	{pspace:0.03, gspace: 0.4001},
	{pspace:0.03, gspace: 0.3001},
	{pspace:0.03, gspace: 0.2001},
	{pspace:0.03, gspace: 0.15001},
	{pspace:0.03, gspace: 0.1001},
	{pspace:0.03, gspace: 0.05001},
	{pspace:0.03, gspace: 0.04001},
	{pspace:0.03, gspace: 0.03001},
	{pspace:0.03, gspace: 0.02001},

	{pspace:0.025, gspace: 0.4001},
	{pspace:0.025, gspace: 0.3001},
	{pspace:0.025, gspace: 0.2001},
	{pspace:0.025, gspace: 0.15001},
	{pspace:0.025, gspace: 0.1001},
	{pspace:0.025, gspace: 0.05001},
	{pspace:0.025, gspace: 0.04001},
	{pspace:0.025, gspace: 0.03001},
	{pspace:0.025, gspace: 0.02001},

	{pspace:0.02, gspace: 0.4001},
	{pspace:0.02, gspace: 0.3001},
	{pspace:0.02, gspace: 0.2001},
	{pspace:0.02, gspace: 0.15001},
	{pspace:0.02, gspace: 0.1001},
	{pspace:0.02, gspace: 0.05001},
	{pspace:0.02, gspace: 0.04001},
	{pspace:0.02, gspace: 0.03001},
	{pspace:0.02, gspace: 0.02001},

	{pspace:0.015, gspace: 0.4001},
	{pspace:0.015, gspace: 0.3001},
	{pspace:0.015, gspace: 0.2001},
	{pspace:0.015, gspace: 0.15001},
	{pspace:0.015, gspace: 0.1001},
	{pspace:0.015, gspace: 0.05001},
	{pspace:0.015, gspace: 0.03001},
	{pspace:0.015, gspace: 0.02001},

	{pspace:0.01, gspace: 0.4001},
	{pspace:0.01, gspace: 0.3001},
	{pspace:0.01, gspace: 0.2001},
	{pspace:0.01, gspace: 0.15001},
	{pspace:0.01, gspace: 0.1001},
	{pspace:0.01, gspace: 0.05001},
	{pspace:0.01, gspace: 0.03001},
	{pspace:0.01, gspace: 0.02001},
	{pspace:0.01, gspace: 0.01001},
];
