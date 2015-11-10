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
			el.style.borderWidth="2px"
			el.style.borderColor="blue"
			el.style.borderStyle="solid"
			el.style.float="left"

			el.setAttribute("aria-selected","true");
		        el.focus();
		}
	});

}
var audios = {};
var playing = false

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
			else{
				$("#flotSpace").empty()
			}
		});

	});
	$('#valuar').click(function(e) {
		submit("recorrerform", "valuar");
	});
	
	$('#audio').click(function(e) {
		var params=$("#audioform").serialize()
		if (!audios[params] && window.localStorage){
			console.log("doesn't exist and has localStorage")
			if (localStorage.getItem(params))
			{
				console.log("its in localStorage")
				audios[params] = new Audio("data:audio/wav;base64," + localStorage.getItem(params))
				audios[params].load();
			}
		}

		if (audios[params]) {
			console.log("its in array")
			if (!audios[params].ended && !audios[params].paused && playing){
				console.log("parar")
				audios[params].pause()//no existe stop
				playing = false
				audios[params].currentTime = 0
				$('#audio').val("reproducir")
			}
			else{
				console.log("reproducir preexistente")
				audios[params].play();
				playing = true
				$('#audio').val("parar")
			}
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
					el.innerHTML = "";
					audios[params] = new Audio("data:audio/wav;base64," + data.results[1].audio);
					audios[params].load();
					audios[params].play();
					playing = true
					console.log("reproducir nuevo")
					console.log(audios[params])
					
					$("#audio").val("parar")

					audios[params].addEventListener("ended",function(e){
						$("#audio").val("reproducir")
						playing = false
					})

					if (window.localStorage){
						localStorage.setItem(params,data.results[1].audio)
					}
					
				}
				else{
					var el = document.getElementById('responses');
					el.innerHTML = "<p>" + data.results.join("</p><p>") + "</p>";
					el.tabIndex=1;
					el.setAttribute("aria-selected","true");
		       		el.focus();
				} 

			}
		});
		}
	});
	
	//controles de estilo

    $(document.body).addClass(localStorage.getItem("style"))
	$("[type=checkbox]").each(
		function(){
			if ($(document.body).hasClass($(this).attr("id"))){
				$(this).prop('checked', true);
			}

			$(this).click(function() {
		        if($(this).is(":checked")) {
					$(document.body).addClass($(this).attr("id"))
					localStorage.setItem("style",$(document.body).attr('class'))
		        }
		        else{
		        	$(document.body).removeClass($(this).attr("id"))
		        	localStorage.setItem("style",$(document.body).attr('class'))
		        }
		    })
		}
	)


});


