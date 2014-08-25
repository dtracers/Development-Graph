function ColorManager() {

	// option 1
	// http://paletton.com/#uid=7040u0kllllaFw0g0qFqFg0w0aF
	var blue1 = "#255E69";
	var green1 = "#2B803E";
	var red1 = "#AA4439";
	var yellow1 = "#AA7039";

	// option 2
	// https://kuler.adobe.com/create/color-wheel/?base=2&rule=Analogous&selected=2&name=My%20Kuler%20Theme&mode=rgb&rgbvalues=0.7193116663247634,0.5605864970943055,1,0.91,0.6690606703952078,0.6291312600322123,1,0.8948968149661796,0.43380747889913507,0.5113426866598781,0.91,0.5800432118275276,0.5064563497545972,0.6892499546892903,1&swatchOrder=0,1,2,3,4
	var purple2 = "#B78FFF";
	var red2 = "#E8ABA0";
	var yellow2 = "#FFE46F";
	var green2 =  "#82E894";
	var blue2 = "#81B0FF";
	this.getNodeColor = function(nodeId, action, dynamic) {
		if (nodeId == "n0") {
			return yellow2;
		}
		if (action == 'feature') {
			return blue2;
		}
		if (action == 'newFeature') {
			return purple2;
		}
		if (dynamic) {
			return green2;
		}
	}
}