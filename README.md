## Image Processor CodeLib Solution
The Image Processor CodeLib solution enables you to resize images to the required dimensions and compress them without distorting the image quality.

**Note:** You can get more detailed information on the steps to install and configure the  Image Processor CodeLib solution from your Catalyst console. You must navigate to the bottom of your Catalyst console where you will find the ***Catalyst CodeLib*** section. You can click on the **Image Processor CodeLib** tile to access the steps.


### How does the CodeLib solution work?


Upon installing this CodeLib solution, pre-defined Catalyst components specific to the solution will be automatically configured in your project. This includes one [Catalyst Serverless function](https://docs.catalyst.zoho.com/en/serverless/help/functions/introduction/) ([Advanced I/O](https://docs.catalyst.zoho.com/en/serverless/help/functions/advanced-io/)) in **Node.js**. We will also be using the Catalyst SmartBrowz service in this CodeLib solution.



Upon the installation of the CodeLib solution, when you invoke the **/resize** endpoint of the **image_processor([Advanced I/O](https://docs.catalyst.zoho.com/en/serverless/help/functions/advanced-io/))** function as a *cURL* request, the image is resized and rendered as a 2-dimensional object with the height and width provided in the request payload, using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) and placed in an HTML file. Along with the dimensions, you must also configure the original image path to file in your local system, in the request payload. We will be using the Catalyst SmartBrowz service to connect to a headless Chrome and take a screenshot of the HTML page served in the browser containing the image. We have implemented this using the Puppeteer framework, a popular Node.js library that is used to control the headless browser using the pre-configured commands in Javascript. The screenshot will be provided as the response in the *.png* format.

You will also need to configure a key named **CODELIB\_SECRET\_KEY** as an [environmental variable ](https://docs.catalyst.zoho.com/en/serverless/help/functions/implementation/#environmental-variables)in the function's code, and pass this in the request header every time you invoke the endpoints of the pre-configured function in the CodeLib solutionThis key allows you to access the Catalyst resources of the CodeLib solution securely.

Similarly, when you invoke the **/compress** endpoint of the **image_processor([Advanced I/O](https://docs.catalyst.zoho.com/en/serverless/help/functions/advanced-io/))** function as a *cURL* request by configuring the original image file path and level of compression required, the image will be compressed based on the inputs provided in the request payload.

Similar to the **/resize** endpoint, we have again used the SmartBrowz's [PDF & Screenshot](https://docs.catalyst.zoho.com/en/smartbrowz/help/pdfnscreenshot/introduction/) component to take a screenshot and send its a response in the *.png* format. Also note that, the height and width dimensions of the input image should be 2000\*2000 pixels.  If the dimensions are any less than the configured limit, we would automatically resize your image to 2000\*2000 pixels using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) and then compress the image based on the required compression level using the [**HTMLCanvasElement.toDataURL()**](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) method of the API.

**Note:** You can get more detailed information on the steps to install and configure the Image Processor CodeLib solution from the ***Catalyst CodeLib*** section in your Catalyst console.

### Resources Involved:

The following Catalyst resources are used as a part of the Image Processor CodeLib solution:

**1. [Catalyst Serverless Functions](https://docs.catalyst.zoho.com/en/serverless/help/functions/introduction/):** 

This **image_processor([Advanced I/O](https://docs.catalyst.zoho.com/en/serverless/help/functions/advanced-io/)) function** handles the logic to resize and compress the input images, and returns the resized or compressed  image as the response in the *.png* format.

**2. [Catalyst SmartBrowz](https://docs.catalyst.zoho.com/en/smartbrowz/getting-started/introduction/):**

We have used Catalyst SmartBrowz service in this CodeLib solution to connect to a headless Chrome browser. The images modified using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) will be in the HTML format. We will input this HTML file to the Puppeteer framework through the SmartBrowz service. This will serve the HTML in a browser webpage and take a screenshot of the updated image using the [PDF & Screenshot component](https://docs.catalyst.zoho.com/en/smartbrowz/help/pdfnscreenshot/introduction/), and return it in the .*png* format.