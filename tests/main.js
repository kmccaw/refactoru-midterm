// GLOBALS
var myDFTs, myImage, myPixelArray;
$(document).on('ready', function() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');
	var imageElement = document.getElementById('myImage');
	var imgSrcs = ['./images/Goofy.png','./images/LakeImage.png', 
		'./images/OceanSunset.png', './images/TrainTrack.png',
		'./images/apple-pie.jpg', './images/CorkscrewFalls.jpg',
		'./images/CanoeBeach.jpg','./images/HavasuFalls.jpg',
		'./images/GirlsBeach.jpg', './images/Teenagers.jpg'];
	var currImgIndex = 0;
	imageElement.src = imgSrcs[currImgIndex];
	var aspectRatio;
	$(imageElement).on('load', function(e)
	{
		aspectRatio = imageElement.width / imageElement.height;
		canvas.height = Math.floor(canvas.width / aspectRatio);
		ctx.drawImage(imageElement, 0, 0,
			canvas.width, canvas.height);
	});

	$('#invertButton').on('click',function(e)
	{
	    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
	    var pixels= imgData.data;
	    var pixelCount = imgData.width * imgData.height * 4;

		for(var i = 0; i < pixelCount; i++)
	    {
	    	//rotata r,g, and b
	    	pixels[i] = 255 - pixels[i]; //red
	    	pixels[i + 1] = 255 - pixels[i + 1]; //green
	    	pixels[i + 2] = 255 - pixels[i + 2]; //blue
	    	pixels[i + 3] = 255; //alpha
	    	i = i + 3;
	    }
	    ctx.clearRect(0,0,canvas.width,canvas.height);
	    ctx.putImageData(imgData,0,0);
	});

	$('#rotateButton').on('click',function(e)
	{
	    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
	    var pixels= imgData.data;
	    var pixelCount = imgData.width * imgData.height;
	    for(var i = 0; i < pixelCount; i++)
	    {
	    	var redIndex = 4*i;
	    	var redValue = pixels[redIndex];
	    	var greenIndex = redIndex + 1;
	    	var greenValue = pixels[greenIndex];
	    	var blueIndex = redIndex + 2;
	    	var blueValue = pixels[blueIndex];
	    	var alphaIndex = redIndex + 3;
	    	var alphaValue = pixels[alphaIndex];

	    	//rotata r,g, and b
	    	pixels[redIndex] = blueValue; //red
	    	pixels[greenIndex] = redValue; //green
	    	pixels[blueIndex] = greenValue; //blue
	    	pixels[alphaIndex] = 255; //alpha
	    }
	    ctx.clearRect(0,0,canvas.width,canvas.height);
	    ctx.putImageData(imgData,0,0);
	});

	$('#rootsButton').on('click',function(e)
	{
	    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
	    var pixels = imgData.data;
	    var pixelCount = imgData.width * imgData.height;
	    for(var i = 0; i < pixelCount; i++)
	    {
	    	var redIndex = 4*i;
	    	var redValue = pixels[redIndex];
	    	var greenIndex = redIndex + 1;
	    	var greenValue = pixels[greenIndex];
	    	var blueIndex = redIndex + 2;
	    	var blueValue = pixels[blueIndex];
	    	var alphaIndex = redIndex + 3;
	    	var alphaValue = pixels[alphaIndex];

	    	//rotata r,g, and b
	    	pixels[redIndex] = Math.ceil(Math.pow(redValue / 255, 0.8) * 255);
	    	pixels[greenIndex] = Math.ceil(Math.pow(greenValue / 255, 0.9) * 255);
	    	pixels[blueIndex] = Math.ceil(Math.pow(blueValue / 255, 1) * 255);
	    	pixels[alphaIndex] = 255; //alpha
	    }
	    ctx.clearRect(0,0,canvas.width,canvas.height);
	    ctx.putImageData(imgData,0,0);
	});

	$('#nextButton').on('click',function(e)
	{
		currImgIndex = ++currImgIndex % imgSrcs.length;
		imageElement.src = imgSrcs[currImgIndex];
	});

	$('#restoreButton').on('click', function(e)
	{
		$(imageElement).trigger('load');
	});

	$('#isolateButton').on('click', function(e)
	{
	    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
	    var pixels= imgData.data;
	    var pixelCount = imgData.width * imgData.height * 4;

		for(var i = 0; i < pixelCount; i++)
	    {
	    	i++;
	    	pixels[i++] = 0; //green
	    	pixels[i++] = 0; //blue
	    }
	    ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.putImageData(imgData,0,0);
	});

	$('#greyscaleButton').on('click', function(e)
	{
	    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
	    var pixels = imgData.data;
	    var pixelCount = imgData.width * imgData.height * 4;
	    var i = 0;
		while (i < pixelCount)
	    {
	    	var mag = Math.floor(255 / 442 * Math.pow(
	    		[pixels[i],pixels[i+1],pixels[i+2]]
	    		.map(function(val)
	    		{
	    			return Math.pow(val,2);
	    		}).reduce(function(prev,curr)
	    		{
	    			return prev + curr;
	    		}),0.5));
	    	//rotata r,g, and b
	    	pixels[i++] = mag; //red
	    	pixels[i++] = mag; //green
	    	pixels[i++] = mag; //blue
	    	pixels[i++] = 255; //alpha
	    }
	    ctx.clearRect(0,0,canvas.width,canvas.height);
	    ctx.putImageData(imgData,0,0);
	});

	$('#setWidthButton').on('click',function(e)
	{
		var newWidth;
		do
		{
			newWidth = parseInt(prompt('width:',canvas.width));
		} while (!newWidth)
		canvas.width = newWidth;
		$(imageElement).trigger('load');
	})

	$('#testoButton').on('click',function(e)
	{
		var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
		myImage = new MyImage(imgData.width,imgData.height,imgData.data);

		var startTime = new Date();
		console.log("startTime:", startTime);
		myDFTs = new calculateDFTs(myImage);
		var duration = new Date() - startTime;
		console.log("duration:", duration);
		var gain = function(u,v,dft)
		{
			var outputPower,radius,pow;
			radius = Math.pow(
				Math.pow(1-(u / dft.width), 2) + Math.pow(1-(v / dft.height), 2),
				0.5);
			pow = dft.power._[u][v];

			// low pass
			// outputPower = (u + v < 200) ? 0 : pow;

			// repair goofy
			// outputPower = (u > 2 && u < 8 && v < 2) ? 0 : pow;
			return outputPower || pow;
		}
		var gainedDFTs = {
			r: myDFTs.r.transformPowers(gain),
			g: myDFTs.g.transformPowers(gain),
			b: myDFTs.b.transformPowers(gain)
		};
		var maxPowerVal = 0;
		var powerChannels = { a: new Matrix(gainedDFTs.r.width,gainedDFTs.r.height)};
		['r','g','b'].forEach(function(channel)
					{
						powerChannels[channel] = gainedDFTs[channel].power;
						powerChannels[channel]._.forEach(function(column,colIndex)
						{
							column.forEach(function(powerVal,rowIndex)
							{
								powerChannels.a._[colIndex][rowIndex] += powerVal;
								if (powerVal > maxPowerVal) maxPowerVal = powerVal;
							});
						});
					});
		powerChannels.a._ = powerChannels.a._
			.map(function(column)
			{
				return column.map(function(rgbSum)
				{
					return ((rgbSum > 0) ? 255 : 0);
				});
			});
		var transformFunc = function(maxPower, val)
		{
			var newVal = Math.floor(500 * Math.log(val + 1) / Math.log(maxPower + 1));
			return (newVal > 255) ? 255 : ((newVal < 0) ? 0 : newVal);
		}.bind(null,maxPowerVal);

		var powerImage = buildImageFromChannels(myImage.width,myImage.height,
			powerChannels,transformFunc);

		var storageCanvas = document.getElementById('testoCanvas');
		$(storageCanvas).css('background-color','#FF0000');
		storageCanvas.width = powerImage.width;
		storageCanvas.height = powerImage.height;

		var aPixelArray = powerImage.getPixelArray({r:true,g:true,b:true,a:true});
		var testImage = new MyImage(gainedDFTs.r.width,gainedDFTs.r.height,
			aPixelArray);

		// var storageCanvas = document.createElement('canvas');
		var storageContext = storageCanvas.getContext('2d');
		var newImgData = storageContext.createImageData(powerImage.width,powerImage.height);
		newImgData.data.set(aPixelArray);
	    storageContext.clearRect(0,0,canvas.width,canvas.height);
		storageContext.putImageData(newImgData,0,0);

		// var testoCanvas = document.getElementById('testoCanvas');
		// testoCanvas.width = canvas.width;
		// testoCanvas.height = canvas.height;
		// var testoCtx = testoCanvas.getContext('2d');
		// testoCtx.drawImage(storageCanvas,0,0,testoCanvas.width,testoCanvas.height);

		var outImage = constructImage(gainedDFTs);
		var outputCanvas = document.getElementById('testoCanvas2');
		outputCanvas.width = outImage.width;
		outputCanvas.height = outImage.height;
		var outputContext = outputCanvas.getContext('2d');
		var outputImageData = outputContext.createImageData(outputCanvas.width,outputCanvas.height);
		var outputPixelArray = outImage.getPixelArray({r:true,g:true,b:true});
		outputImageData.data.set(outputPixelArray);
		outputContext.putImageData(outputImageData,0,0);
	});
});