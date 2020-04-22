/* using ajax-utils.js for HTTP requestor (asynchronous), e.g. loading data
无效解决方案： chrome添加启动参数：--allow-file-access-from-files ，这样本地ajax请求就不会报跨域错误了
解决： 使用local http server: browser-sync start --server --directory ---files "*"
*/

(function (global) {

  // Set up a namespace for our utility
  var ajaxUtils = {};
  
  
  // Returns an HTTP request object
  function getRequestObject() {
    if (window.XMLHttpRequest) {
      return (new XMLHttpRequest());
    } 
    else if (window.ActiveXObject) {
      // For very old IE browsers (optional)
      return (new ActiveXObject("Microsoft.XMLHTTP"));
    } 
    else {
      global.alert("Ajax is not supported!");
      return(null); 
    }
  }
  
  
  // Makes an Ajax GET request to 'requestUrl'
  ajaxUtils.sendGetRequest = 
    function(requestUrl, responseHandler, isJsonResponse) {
      var request = getRequestObject();
      request.onreadystatechange = 
        function() { 
          handleResponse(request, 
                         responseHandler,
                         isJsonResponse); 
        };


      /* a learning note:
      true: asyschronous, meaning more than one execution, returns right away,
            i.e. HTTP requestor
      false: syschronous, only one at a time, can't start another 
            instruction until the first finished, i.e. JavaScript Engine
      */

      request.open("GET", requestUrl, true);
      request.send(null); // for POST only
    };
  
  
  // Only calls user provided 'responseHandler'
  // function if response is ready
  // and not an error
  function handleResponse(request,
                          responseHandler,
                          isJsonResponse) {
    if ((request.readyState == 4) &&
       (request.status == 200)) {
  
      // Default to isJsonResponse = true
      if (isJsonResponse == undefined) {
        isJsonResponse = true;
      }
  
      if (isJsonResponse) {
        responseHandler(JSON.parse(request.responseText));
      }
      else {
        responseHandler(request.responseText);
      }
    }
  }
  
  
  // Expose utility to the global object
  global.$ajaxUtils = ajaxUtils;
  
  
  })(window);
  
  