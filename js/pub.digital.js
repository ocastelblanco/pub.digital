// Carga de documento PDF
PDFJS.workerSrc = 'js/pdf.js';
var nombrePDF = 'html5-for-web-designers.pdf';
var actualPag = 1;
var totalPag;
var pagXpag = 1;
var anchoTablet = 640;
var anchoVentana = window.innerWidth*0.99;
var altoVentana = window.innerHeight*0.99;
$(document).on('pageinit', '#vistaPDF', function() {
	cargaPDF(nombrePDF);
});
function cargaPDF(nombre) {
	PDFJS.getDocument('pdf/'+nombre).then(function(pdf) {
		totalPag = pdf.pdfInfo.numPages;
		if (anchoVentana > anchoTablet) {
			pagXpag = 2;
		}
		var numPagina = 1;
		for (var i = 0; i<(totalPag/pagXpag); i++) {
			var numHoja = i+1;
			var nombreHoja = 'PDF'+numHoja;
			var cont = '<div data-role="page" id="'+nombreHoja+'"><div data-role="header" data-id="encPag" data-fullscreen="true" data-position="fixed"><h3>Titulo del libro</h3></div><div data-role="content" id="contenido"></div><div data-role="footer" data-id="navPag" data-fullscreen="true" data-position="fixed"><h3>Pagina</h3></div></div>';
			$('body').append(cont);
			$('#vistaPDF #contenido').append('<a href="#'+nombreHoja+'" data-role="button" data-inline="true">Hoja '+numHoja+'</a>');
			for (var g=0;g<pagXpag;g++) {
				if (numPagina <= totalPag) {
					var nombrePagina = 'pag'+numPagina;
					$('#'+nombreHoja+' #contenido').append('<canvas id="'+nombreHoja+nombrePagina+'">');
					cargaPagina(pdf, nombreHoja+nombrePagina, numPagina, pagXpag, numHoja);
					numPagina++;
				}
			}
			$('#'+nombreHoja+' [data-role="header"]').html('<a href="#vistaPDF" data-role="button" data-icon="home" data-iconpos="notext">Inicio</a><h3>Titulo del libro</h3>');
			$('#'+nombreHoja+' [data-role="footer"]').html('<nav id="paginas"><a href="#PDF'+(Number(nombreHoja.substr(3))-1)+'" data-role="button" data-icon="arrow-l" data-iconpos="notext" data-transition="slide" data-direction="reverse">Anterior</a><a href="#PDF'+(Number(nombreHoja.substr(3))+1)+'" data-role="button" data-icon="arrow-r" data-iconpos="notext" data-transition="slide">Siguiente</a></nav>');
			$('#'+nombreHoja).on('swipeleft', function() {
				var destino = "PDF"+(Number($(this).attr('id').substr(3))+1);
				$.mobile.changePage("#"+destino, {
					transition: "slide"
				});
			});
			$('#'+nombreHoja).on('swiperight', function() {
				var destino = "PDF"+(Number($(this).attr('id').substr(3))-1);
				$.mobile.changePage("#"+destino, {
					transition: "slide",
					reverse: true
				});
			})
		}
		$('#vistaPDF #contenido').trigger('create');
	});
}
function cargaPagina(pdf, nomCanvas, pag, paginas, hoja) {
	pdf.getPage(pag).then(function(page) {
		var canvas = document.getElementById(nomCanvas);
		var context = canvas.getContext('2d');
		var viewport = page.getViewport(1); //El número dentro del paréntesis es la escala
		var scale = (anchoVentana/paginas)/viewport.width;
		if (scale*viewport.height > (altoVentana)) {
			scale = altoVentana/viewport.height;
		}
		viewport = page.getViewport(scale);
		canvas.height = viewport.height;
		canvas.width = viewport.width;
		var renderContext = {
			canvasContext: context,
			viewport: viewport
		};
		page.render(renderContext);
		$('#'+nomCanvas).css('margin-top', (window.innerHeight-viewport.height)/2);
		if((pag/hoja) == paginas) {
			$('#PDF'+hoja+'pag'+(pag-1)).css('margin-left', (window.innerWidth-(viewport.width*paginas))/2);
		} else if (pag == totalPag) {
			$('#'+nomCanvas).css('margin-left', (window.innerWidth-viewport.width)/2);
		}
	});
}