// global variables
var sourceImageIndex;
var sourceImagesArray;

// cached DOM elements
var sourceImage;
var inputDisplayCanvas;
var inputStorageCanvas;
var inputGalleryHeading;
var outputDisplayCanvas;
var outputStorageCanvas;

// page utitlity methods
var initialize = function()
{
	sourceImageIndex = 0;
	sourceImagesArray = 
		[
			'./images/CanoeBeach.jpg','./images/LakeImage.png', 
			'./images/OceanSunset.png', './images/TrainTrack.png',
			'./images/apple-pie.jpg', './images/CorkscrewFalls.jpg',
			'./images/Goofy.png', './images/HavasuFalls.jpg',
			'./images/GirlsBeach.jpg', './images/Teenagers.jpg'
		];
	sourceImage = document.getElementById('source-image');
	setImageSource();
	inputDisplayCanvas = document.getElementById('input-display-canvas');
	inputStorageCanvas = document.getElementById('input-storage-canvas');
	inputGalleryHeading = $('#input-gallery').find('.gallery-header')[0];
	outputDisplayCanvas = document.getElementById('output-display-canvas');
	outputStorageCanvas = document.getElementById('output-storage-canvas');
	$('#set-width-anchor').on('click',function(e)
	{
		var promptedWidth = prompt('Set the horizontal resolution to:',
			inputStorageCanvas.width);
		var aspect = sourceImage.height / sourceImage.width;
		inputStorageCanvas.width = promptedWidth;
		inputStorageCanvas.height = Math.floor(aspect * promptedWidth);
		inputStorageCanvas.getContext('2d').drawImage(sourceImage,
			0, 0, inputStorageCanvas.width, inputStorageCanvas.height);
		inputDisplayCanvas.height = Math.floor(aspect * inputDisplayCanvas.width);
		inputDisplayCanvas.getContext('2d').drawImage(inputStorageCanvas,
			0, 0, inputDisplayCanvas.width, inputDisplayCanvas.height);
	});
	window.onresize = resetDisplayCanvasResolution.bind(null,1);
}
var resetDisplayCanvasResolution = function(percentOfWidth)
{
	percentOfWidth = percentOfWidth || 1;
	var inAspect = inAspect || 0.6;
	// var outAspect = outAspect || inAspect;
	var newWidth = percentOfWidth * inputGalleryHeading.offsetWidth;
	inputDisplayCanvas.width = newWidth;
	inputDisplayCanvas.height = inAspect * newWidth;
	inputDisplayCanvas.getContext('2d').drawImage(inputStorageCanvas,
		0, 0, inputDisplayCanvas.width, inputDisplayCanvas.height);
}

var setImageSource = function()
{
	sourceImage.src = sourceImagesArray[sourceImageIndex];
	$(sourceImage).one('load',function()
	{
		console.log("1:", 1);
		inputStorageCanvas.width = sourceImage.naturalWidth;
		inputStorageCanvas.height = sourceImage.naturalHeight;
		inputStorageCanvas.getContext('2d').drawImage(sourceImage,
			0, 0, inputStorageCanvas.width, inputStorageCanvas.height);
		inputDisplayCanvas.getContext('2d').drawImage(inputStorageCanvas,
			0, 0, inputDisplayCanvas.width, inputDisplayCanvas.height);
	})
}

$(document).on('ready', function() {
	initialize();
	resetDisplayCanvasResolution();
});