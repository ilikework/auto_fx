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
		//{min:118, max:125, act:'sell', amount:200, pspace:0.05, gspace: 0.1501},
		//{min:90, max:128, act:'sellbuy', amount:2000, pspace:0.5, gspace: 1.0001},
		//{min:104, max:110, act:'buy', amount:200, pspace:0.06, gspace: 0.1501},
		//{min:95, max:104, act:'buy', amount:200, pspace:0.05, gspace: 0.1501},


		//{min:90, max:128, act:'sellbuy', amount:2000, pspace:0.5, gspace: 1.0001},
		{min:90, max:128, act:'sellbuy', amount:200, pspace:0.05, gspace: 0.1501},
	],
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
