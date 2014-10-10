var Complex = function(real,imaginary)
{
	this.re = real || 0;
	this.im = imaginary || 0;
}
Complex.prototype.addTo = function() {
	if (arguments[0])
	{
		if (arguments.length === 1 && arguments[0] instanceof Complex)
		{
			return this.addComplexTo(arguments[0]);
		}
		else if (typeof arguments[0] === 'number')
		{
			this.re += arguments[0];
			return this;
		}
	}
	if(arguments[1] && typeof arguments[1] === 'number')
	{
		this.im += arguments[1];
		return this;
	}
};
Complex.prototype.addComplexTo = function(complexSummand)
{
	this.re += complexSummand.re;
	this.im += complexSummand.im;
	return this;
};
Complex.prototype.multiplyBy = function() {
	if (arguments.length === 1)
	{
		if (typeof arguments[0] === 'number')
		{
			this.re *= arguments[0];
			this.im *= arguments[0];
			return this;
		}
		else// if (arguments[0] instanceof Complex)
		{
			return this.multiplyByComplex(arguments[0]);
		}
	}
	else if(arguments[1]
		&& typeof arguments[0] === 'number'
		&& typeof arguments[1] === 'number')
	{
		return this.multiplyByComplex(new Complex(arguments[0], arguments[1]));
	}
};
Complex.prototype.multiplyByComplex = function(val) {
	var product = {
		re: this.re * val.re - this.im * val.im,
		im: this.re * val.im + this.im * val.re
	}
	this.re = product.re;
	this.im = product.im;
	return this;
};
Complex.prototype.getMagnitude = function() {
	return (Math.pow(this.re,2) + Math.pow(this.im,2));
};

var complexFactory = {
	empty: function()
	{
		return new Complex(0,0);
	},
	clone: function(complex)
	{
		return new Complex(complex.re,complex.im);
	},
	expi: function(theta)
	{
		return new Complex(Math.cos(theta), Math.sin(theta));
	}
};

var Matrix = function(width,height,defaultValue)
{
	defaultValue = (defaultValue === undefined ? 0 :
			(typeof defaultValue === 'function' ? defaultValue.call() : defaultValue));
	this._ = new Array(width);
	for (var i = 0; i < width; i++)
	{
		this._[i] = new Array(height);
		for (var j = 0; j < height; j++)
		{
			this._[i][j] = defaultValue;
		}
	}
}

var Pixel = function(r,g,b,a)
{
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
	this.a = a && 255;
}

var MyImage = function(width, height, pixelArray)
{
	this.width = width;
	this.height = height;
	this.pixels = new Matrix(width,height);
	if (pixelArray)
	{
		var index = 0;
		for (var y = 0; y < height; y++)
		{
			for (var x = 0; x < width; x++)
			{
				this.pixels._[x][y] = new Pixel(
					pixelArray[index++],
					pixelArray[index++],
					pixelArray[index++],
					pixelArray[index++]);
			}
		}
	}
}
/** 
 * Build an array of bytes, four for each pixel (rgba)
 * @param {Object} includeChannels An object with a defined property
 *                                 for each channel to be included in
 *                                 the output array (as non-zero values)
 */
MyImage.prototype.getPixelArray = function(include) {
	if (include && 
		!(include.r && include.g && include.b && include.a))
	{
		var altPixels = new Matrix(this.width,this.height);
		altPixels._ = this.pixels._.map(function(col)
		{
			return col.map(function(pixel)
			{
				return new Pixel(
					include.r ? pixel.r : 0,
					include.g ? pixel.g : 0,
					include.b ? pixel.b : 0,
					include.a ? pixel.a : 255);
			});
		});
		return buildPixelArray(this.width,this.height,altPixels); 
	}
	else
		return buildPixelArray(this.width,this.height,this.pixels); 
};

var buildPixelArray = function(width,height,pixels)
{
	var pixelArray = new Uint8ClampedArray(4*width*height);
	var index = 0;
	for (var y = 0; y < height; y++)
	{
		for (var x = 0; x < width; x++)
		{
			pixelArray[index++] = pixels._[x][y].r;
			pixelArray[index++] = pixels._[x][y].g;
			pixelArray[index++] = pixels._[x][y].b;
			pixelArray[index++] = pixels._[x][y].a;
		}
	}
	return pixelArray;
}

var calculateDFTs = function(img)
{
	var channelDFTs = {
		r: new DFT(img.width,img.height),
		g: new DFT(img.width,img.height),
		b: new DFT(img.width,img.height)/*,
		a: new DFT(img.width,img.height)*/
	};

	var coefs = {
		r: new Matrix(img.width,img.height),
		g: new Matrix(img.width,img.height),
		b: new Matrix(img.width,img.height)/*,
		a: new Matrix(img.width,img.height,complexFactory.empty)*/
	};

	var innerCoefs = {
		r: new Array(img.height),
		g: new Array(img.height),
		b: new Array(img.height)/*,
		a: new Array(img.height)*/
	};

	var inverseArea = 1/(img.width * img.height);
	for (var u = 0; u < img.width; u++)
	{
		// calc inner coefs
		for (var y = 0; y < img.height; y++)
		{
			innerCoefs.r[y] = complexFactory.empty();
			innerCoefs.g[y] = complexFactory.empty();
			innerCoefs.b[y] = complexFactory.empty();
			for (var x = 0; x < img.width; x++)
			{
				var theta = -2 * Math.PI * u * x / img.width;
				var basisVal = complexFactory.expi(theta);
				var pixel = img.pixels._[x][y];
				var nextTerm = {
					r: complexFactory.clone(basisVal).multiplyBy(pixel.r),
					g: complexFactory.clone(basisVal).multiplyBy(pixel.g),
					b: complexFactory.clone(basisVal).multiplyBy(pixel.b)
				};
				innerCoefs.r[y].addComplexTo(nextTerm.r);
				innerCoefs.g[y].addComplexTo(nextTerm.g);
				innerCoefs.b[y].addComplexTo(nextTerm.b);
			}
		}

		for (var v = 0; v < img.height; v++)
		{
			coefs.r._[u][v] = new Complex();
			coefs.g._[u][v] = new Complex();
			coefs.b._[u][v] = new Complex();
			for (var y = 0; y < img.height; y++)
			{
				var theta = -2 * Math.PI * v * y / img.height;
				var basisVal = complexFactory.expi(theta);
				coefs.r._[u][v].addComplexTo(complexFactory.clone(basisVal).multiplyBy(innerCoefs.r[y]));
				coefs.g._[u][v].addComplexTo(complexFactory.clone(basisVal).multiplyBy(innerCoefs.g[y]));
				coefs.b._[u][v].addComplexTo(complexFactory.clone(basisVal).multiplyBy(innerCoefs.b[y]));
			}
			coefs.r._[u][v].multiplyBy(inverseArea);
			coefs.g._[u][v].multiplyBy(inverseArea);
			coefs.b._[u][v].multiplyBy(inverseArea);
		}

		if(u % 50 === 0) console.log('Complete:', String(100 * u / img.width).slice(0,4) + '%');
	}
	console.log("coefs:", coefs);
	channelDFTs.r.updateCoef(coefs.r);
	channelDFTs.g.updateCoef(coefs.g);
	channelDFTs.b.updateCoef(coefs.b);
	// channelDFTs.a.updateCoef(coefs.a);
	return channelDFTs;
}

var DFT = function(width,height,power,phase)
{
	this.width = width;
	this.height = height;
	this.coefs = null;
	this.power = power || new Matrix(width,height);
	this.phase = phase || new Matrix(width,height);
}
DFT.prototype.updateCoef = function(coefs) {
	this.coefs = coefs;
	for (var u = 0; u < this.width; u++)
	{
		for (var v = 0; v < this.height; v++)
		{
			var currentCoef = coefs._[u][v];
			this.power._[u][v] = Math.pow(Math.pow(currentCoef.re, 2)
				+ Math.pow(currentCoef.im,2), 0.5);
			this.phase._[u][v] = Math.atan2(currentCoef.im,currentCoef.re);
		}
	}
};
DFT.prototype.transformPowers = function(gainFunc) {
	var newPower = new Matrix(this.width,this.height);
	for (var u = 0; u < this.width; u++)
	{
		for (var v = 0; v < this.height; v++)
		{
			(function(u,v,dft)
			{
				newPower._[u][v] = gainFunc(u,v,dft);
			}) (u,v,this);
		}
	}
	var transformedDFT = new DFT(this.width,this.height,newPower,this.phase);
	return transformedDFT;
};


var buildImageFromChannels = function(width, height, channelMatrices, transformFunc)
{
	var output = new MyImage(width,height);
	var r = channelMatrices.r || false;
	var g = channelMatrices.g || false;
	var b = channelMatrices.b || false;
	var a = channelMatrices.a || false;
	console.log('rgba:',r,g,b,a);
	var transformValue = transformFunc || function(val)
	{
		return (val > 255) ? 255 : ((val < 0) ? 0 : val);
	};
	for (var x = 0; x < width; x++)
	{
		for (var y = 0; y < height; y++)
		{
			output.pixels._[x][y] = new Pixel(
				(r ? transformValue(r._[x][y]): 0),
				(g ? transformValue(g._[x][y]): 0),
				(b ? transformValue(b._[x][y]): 0),
				(a ? transformValue(a._[x][y]): 255)
			);
		}
	}

	return output;
};

var constructImage = function(dfts)
{
	var values = (function(width,height)
		{
			return {
			width: width,
			height: height,
			r: new Matrix(width,height),
			g: new Matrix(width,height),
			b: new Matrix(width,height)};
		}) (dfts.r.width,dfts.r.height);
	var innerCoefs = {
		r: new Array(values.height),
		g: new Array(values.height),
		b: new Array(values.height)/*,
		a: new Array(values.height)*/
	};

	for (var x = 0; x < values.width; x++)
	{
		// calculate inner coefs
		for (var v = 0; v < values.height; v++)
		{
			innerCoefs.r[v] = complexFactory.empty();
			innerCoefs.g[v] = complexFactory.empty();
			innerCoefs.b[v] = complexFactory.empty();
			var theta, basisVal, complexCoef, nextTerm;
			for (var u = 0; u < values.width; u++)
			{
				theta = 2 * Math.PI * u * x / values.width;
				basisVal = complexFactory.expi(theta);
				complexCoef = {
					r: complexFactory.expi(dfts.r.phase._[u][v]).multiplyBy(dfts.r.power._[u][v]),
					b: complexFactory.expi(dfts.b.phase._[u][v]).multiplyBy(dfts.b.power._[u][v]),
					g: complexFactory.expi(dfts.g.phase._[u][v]).multiplyBy(dfts.g.power._[u][v])
				}
				nextTerm = {
					r: complexFactory.clone(basisVal).multiplyByComplex(complexCoef.r),
					g: complexFactory.clone(basisVal).multiplyByComplex(complexCoef.g),
					b: complexFactory.clone(basisVal).multiplyByComplex(complexCoef.b)
				};
				innerCoefs.r[v].addComplexTo(nextTerm.r);
				innerCoefs.g[v].addComplexTo(nextTerm.g);
				innerCoefs.b[v].addComplexTo(nextTerm.b);

			}
		}

		for (var y = 0; y < values.height; y++)
		{
			values.r._[x][y] = complexFactory.empty();
			values.g._[x][y] = complexFactory.empty();
			values.b._[x][y] = complexFactory.empty();
			for (var v = 0; v < values.height; v++)
			{
				theta = 2 * Math.PI * v * y / values.height;
				basisVal = complexFactory.expi(theta);
				nextTerm = {
					r: complexFactory.clone(basisVal).multiplyByComplex(innerCoefs.r[v]),
					g: complexFactory.clone(basisVal).multiplyByComplex(innerCoefs.g[v]),
					b: complexFactory.clone(basisVal).multiplyByComplex(innerCoefs.b[v])
				};
				values.r._[x][y].addComplexTo(nextTerm.r);
				values.g._[x][y].addComplexTo(nextTerm.g);
				values.b._[x][y].addComplexTo(nextTerm.b);
			}
		}

		if(x % 50 === 0) console.log('Complete:', String(100 * x / values.width).slice(0,4) + '%');
	}
	['r','g','b'].forEach(function(channel)
	{
		values[channel]._ = values[channel]._.map(function(column)
			{
				return column.map(function(complexVal)
				{
					return (complexVal instanceof Complex)
						? complexVal.re : complexVal;
				});

			});
	});
	var outputImage = buildImageFromChannels(values.width,values.height,values);

	
	return outputImage;
}







