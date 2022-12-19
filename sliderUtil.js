function makeSlider(id, min, max) {

	var mn = 0;
	var mx = 1;

	if (arguments.length === 3) {
		mn = arguments[1];
		mx = arguments[2];
	}

	var d = document.createElement("span");
	d.setAttribute("class", "widget");
	d.setAttribute("id", id + "widget");
	
	var minPoint = document.createElement("input");
	minPoint.setAttribute("type", "text")
	minPoint.setAttribute("class", "slider limit")
	minPoint.setAttribute("value", mn)
	minPoint.setAttribute("id", id + "min")

	var r = document.createElement("input");
	r.setAttribute("type", "range")
	r.setAttribute("class", "slider")
	r.setAttribute("min", mn)
	r.setAttribute("value", (mx-mn)/2)
	r.setAttribute("max", mx)
	r.setAttribute("step", 1/10000)
	r.setAttribute("id", id + "slider")

	var maxPoint = document.createElement("input");
	maxPoint.setAttribute("type", "text")
	maxPoint.setAttribute("class", "slider limit")
	maxPoint.setAttribute("value", mx)
	maxPoint.setAttribute("id", id + "max")

	d.appendChild(minPoint);
	d.appendChild(r);
	d.appendChild(maxPoint);
	
	d.setMax = function(v) {
		max.value = v;
		r.max = v;
	}
	
	d.setMin = function(v) {
		min.value = v;
		r.min = v;
	}
	
	d.set = function(v) {
		if (v >= min.value && v <= max.value) {
			r.value = v;	
		}
	}
	
	return d;
}
	
