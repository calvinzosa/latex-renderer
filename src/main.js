$(() => {
	$('img').attr('draggable', 'false');
	
	console.log('creating math field input');
	
	const MQ = MathQuill.getInterface(2);
	
	const renderContext = $('#render')[0].getContext('2d');
	let svg = null;
	
	function updateRender() {
		const latex = latexInput.latex();
		
		const renderColor = $('#render-color').val();
		const sizeValue = $('#size-range').val();
		
		svg = MathJax.tex2svg(latex).childNodes[0];
		$(svg).css('color', renderColor);
		
		$('#size-label').text(`${sizeValue}px`);
		
		localStorage.setItem('saved-latex', latex);
		localStorage.setItem('saved-color', renderColor);
		localStorage.setItem('saved-size', sizeValue);
		
		const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(svgBlob);
		
		const img = new Image();
		
		img.onload = async () => {
			const canvas = renderContext.canvas;
			canvas.width = img.width * sizeValue;
			canvas.height = img.height * sizeValue;
			
			renderContext.drawImage(img, 0, 0, canvas.width, canvas.height);
			
			URL.revokeObjectURL(url);
			img.remove();
		}
		
		img.src = url;
		
		setTimeout(updateRender, 100);
	}
	
	const latexInput = MQ.MathField($('#latex-input')[0]);
	
	const savedLatex = localStorage.getItem('saved-latex');
	if (savedLatex) {
		latexInput.latex(savedLatex);
	}
	
	const savedColor = localStorage.getItem('saved-color');
	if (savedColor) {
		$('#render-color').val(savedColor);
	}
	
	const savedSize = localStorage.getItem('saved-size');
	if (savedSize) {
		$('#size-range').val(savedSize);
	}
	
	requestAnimationFrame(updateRender);
	
	$('#copy-svg').on('click', async (event) => {
		if (event.button === 0) {
			if (!svg) {
				return;
			}
			
			const newCanvas = new OffscreenCanvas(renderContext.canvas.width, renderContext.canvas.height);
			newCanvas.getContext('2d').drawImage(renderContext.canvas, 0, 0);
			
			const blob = await newCanvas.convertToBlob();
			const item = new ClipboardItem({ 'image/png': blob });
			
			await navigator.clipboard.write([item]);
		}
	});
	
	$('#save-svg').on('click', async (event) => {
		if (event.button === 0) {
			if (!svg) {
				return;
			}
			
			const svgData = svg instanceof SVGElement ? svg.outerHTML : svg;
			
			const blob = new Blob([svgData], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			
			const a = document.createElement('a');
			a.href = url;
			a.download = 'render.svg';
			a.click();
			
			URL.revokeObjectURL(url);
			a.remove();
		}
	});
});
