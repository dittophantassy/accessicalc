//esta funcion toma el form con id "form", lo serializa,
//lo manda por GET a "url" y pone el resultado en el div "responses"
function submit(form, url) {
	$.ajax({
		type : "GET",
		url : url,
		contentType : "application/json; charset=utf-8",
		encoding : "UTF-8",
		dataType : "json",
		data : $("#" + form).serialize(),
		success : function(data) {
			console.log(data);
			var el = document.getElementById('responses');
			el.innerHTML = "<p>" + data.results.join("</p><p>") + "</p>";
			el.tabIndex=1;
			el.setAttribute("aria-selected","true");
		        el.focus();
		}
	});

}
var numAudios=3;
var currentAudios=0
var audios={};

$(document).ready(function() {
	$('#analisis').click(function(e) {
		submit("analisisform", "analisis");
	});
	
	$('#recorrer').click(function(e) {
		submit("recorrerform", "recorrer");
		$.getJSON("graficar", $("#recorrerform").serialize(), function(data) {
			if (data.results.label) {
				var el = document.getElementById('graph');
				el.innerHTML = "";
				var div = document.createElement('div');
				div.style.cssText = "width:600px;height:500px;";
				div.id = "flotSpace";
				el.appendChild(div);
				var options = {
					lines : {
						show : true
					},
					points : {
						show : true
					},
					xaxis : {
						tickDecimals : 0,
						tickSize : 1
					}
				};

				$.plot($("#flotSpace"), [data.results], options);
			}
		});

	});
	$('#valuar').click(function(e) {
		submit("recorrerform", "valuar");
	});
	
	$('#audio').click(function(e) {
		var params=$("#audioform").serialize()
		if (audios[params]) {
			audios[params].play();
		} else{
		$.ajax({
			type : "GET",
			url : "audio",
			contentType : "application/json; charset=utf-8",
			encoding : "UTF-8",
			dataType : "json",
			data : $("#audioform").serialize(),
			success : function(data) {
				console.log(data);

				var el = document.getElementById('responses');
				if (data.results[1] && data.results[1].audio) {
					audios[params] = new Audio("data:audio/wav;base64," + data.results[1].audio);
					audios[params].play();
				}
			}
		});
		}
	});
});
