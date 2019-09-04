/* run next then create encode account information for you (need change your ID and PWD in test_base64 first):
   node fxmp.js -cmd base64

关于cfg_user编码的生成，请参照fxmp.js最前面的说明，在test_base64函数中生成
 */
cfg_user = 'xxxxxxx'; //base64 encode
cfg_orderinfo = {
	pair: 'USD/JPY',
	pairamount: 100,
	maxbalnceamount: 600 * 100, //买和卖抵消后绝对值数量
	maxtotalamount: 610 * 100, //买和卖简单合计数量
	minremain: 300000, //最少剩余余额，少于这个交易停止
	pricerang: [ //当价格处于定义范围之外或act为空时停止交易
	             //当act为gain时停止新规，只按gspace处理有利益的记录
		//范围开始，结束，动作(sell/buy/auto/gain)，价格间隔，利益间隔
		//当act为auto时自动根据买或卖数量来平衡
		{min:116, max:130, act:'sell', amount:0, amount_s:600, pspace:0.05, pspace_s:0.05, gspace: 0.1501},
		{min:114, max:116, act:'sellbuy', amount:100, amount_s:500, pspace:0.05, pspace_s:0.05, gspace: 0.1501},
		{min:112, max:114, act:'sellbuy', amount:200, amount_s:400, pspace:0.05, pspace_s:0.05, gspace: 0.1501},
		{min:106, max:112, act:'sellbuy', amount:300, amount_s:300, pspace:0.05, pspace_s:0.05, gspace: 0.1501},
		{min:104, max:106, act:'sellbuy', amount:400, amount_s:200, pspace:0.05, pspace_s:0.05, gspace: 0.1501},
		{min:102, max:104, act:'sellbuy', amount:500, amount_s:100, pspace:0.05, pspace_s:0.05, gspace: 0.1501},
		{min:90, max:102, act:'buy', amount:600, amount_s:0, pspace:0.05, pspace_s:0.05, gspace: 0.1501},
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
