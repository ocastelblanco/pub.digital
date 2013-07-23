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
		var numHoja = 1;
		creaPaginas(pdf, numPagina, numHoja, true);
	});
}
function creaPaginas(pdf, numPagina, numHoja, hojaNueva) {
	var nombreHoja = 'PDF'+numHoja;
	if (hojaNueva) {
		var cont = '<div data-role="page" id="'+nombreHoja+'"><div data-role="header" data-fullscreen="true" data-position="fixed"></div><div data-role="content" id="contenido"></div><div data-role="footer" data-id="navPag" data-fullscreen="true" data-position="fixed"></div></div>';
		$('body').append(cont);
		$('#vistaPDF [data-role="header"] h3').html(nombrePDF);
		$('#vistaPDF [data-role="footer"] h3').html('Total de páginas: '+totalPag);
		$('#vistaPDF #contenido').append('<a href="#'+nombreHoja+'" class="vinculoHoja"><div id="numerosPagina"><span class="precargando"></span><span class="precargando"></span></div><div id="numerosHoja">Hoja '+numHoja+'</div></a>');
		$('#'+nombreHoja+' [data-role="header"]').html('<a href="#vistaPDF" data-role="button" data-icon="home" data-iconpos="notext">Inicio</a><h3>'+nombrePDF+'</h3>');
		$('#'+nombreHoja+' [data-role="footer"]').html('<nav id="paginas"></nav>');
		if (numHoja < (totalPag/pagXpag)) {
			$('#'+nombreHoja+' [data-role="footer"] nav').append('<a href="#PDF'+(numHoja+1)+'" data-role="button" data-icon="arrow-r" data-iconpos="notext" data-transition="slide">Siguiente</a>');
			$('#'+nombreHoja).on('swipeleft', function() {
				var destino = "PDF"+(Number($(this).attr('id').substr(3))+1);
				$.mobile.changePage("#"+destino, {
					transition: "slide"
				});
			});
		}
		if (numHoja > 1) {
			$('#'+nombreHoja+' [data-role="footer"] nav').prepend('<a href="#PDF'+(numHoja-1)+'" data-role="button" data-icon="arrow-l" data-iconpos="notext" data-transition="slide" data-direction="reverse">Anterior</a>');
			$('#'+nombreHoja).on('swiperight', function() {
				var destino = "PDF"+(Number($(this).attr('id').substr(3))-1);
				$.mobile.changePage("#"+destino, {
					transition: "slide",
					reverse: true
				});
			});
		}
	}
	//$('#vistaPDF #contenido').trigger('create');
	var nombrePagina = 'pag'+numPagina;
	var nomCanvas = nombreHoja+nombrePagina;
	$('#'+nombreHoja+' #contenido').append('<canvas id="'+nomCanvas+'" class="precargando">');
	pdf.getPage(numPagina).then(function(page) {
		var canvas = document.getElementById(nomCanvas);
		var context = canvas.getContext('2d');
		var viewport = page.getViewport(1); //El número dentro del paréntesis es la escala
		var scale = (anchoVentana/pagXpag)/viewport.width;
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
		$('#'+nomCanvas).css('margin-top', (window.innerHeight-viewport.height)/2);
		if((numPagina/numHoja) == pagXpag) {
			$('#PDF'+numHoja+'pag'+(numPagina-1)).css('margin-left', (window.innerWidth-(viewport.width*pagXpag))/2);
		} else if (numPagina == totalPag) {
			$('#'+nomCanvas).css('margin-left', (window.innerWidth-viewport.width)/2);
		}
		page.render(renderContext).then(function() {
			$('#'+nomCanvas).removeClass('precargando');
			$('#vistaPDF #precarga').html('Cargando hoja '+numHoja+' de '+Math.ceil(totalPag/pagXpag));
			if (!hojaNueva) {
				numHoja++;
				$('a.vinculoHoja[href="#'+nombreHoja+'"] #numerosPagina span:last-child').html(numPagina).removeClass('precargando');
			} else {
				$('a.vinculoHoja[href="#'+nombreHoja+'"] #numerosPagina span:first-child').html(numPagina).removeClass('precargando');
			}
			numPagina++;
			if (numPagina <= totalPag) {
				creaPaginas(pdf, numPagina, numHoja, !hojaNueva);
			} else {
				$('#vistaPDF #precarga').remove();
				$('a.vinculoHoja #numerosPagina span').removeClass('precargando');
			}
		});
	});

}