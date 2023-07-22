public class RestClasses {
     public static void main(){
         HttpRequest request = new HttpRequest();
         request.setEndpoint('https://mvclouds29-dev-ed.develop.my.salesforce.com/services/oauth2/token?grant_type=password&client_id=3MVG9fe4g9fhX0E71nnkMx60HwrbvDLZJqeomupQH8bgZnyx4AEwFJn9EbDySPZKOsIS2X7.BWFGY9OMF.s5C&client_secret=A0FC9747723055DF1FC84FF31215EED3547ADA5290D4EBFA89205D875D4E5E5C&username=nimi@gmail.com&password=24_whitedevil');
         request.setMethod('POST');
         Http http = new Http();
         HttpResponse response = new HttpResponse();
         response = http.send(request);
         system.debug('response body -- '+ response.getStatus());
         system.debug('response body -- '+ response.getBody());
         Oauth oauthdata = (Oauth)JSON.deserialize(response.getBody(),Oauth.class);
         if(oauthdata.access_token != null){
            HttpRequest request1 = new HttpRequest();
            request1.setEndpoint('https://mvclouds29-dev-ed.develop.my.salesforce.com/services/apexrest/getBoard');
            request1.setMethod('GET');
            request1.setHeader('Content-Type', 'application/json');
            request1.setHeader('Authorization', 'Bearer '+oauthdata.access_token);
            Http http1 = new Http();
            HttpResponse response1 = new HttpResponse();
            response1 = http1.send(request1);
            system.debug('response body -- '+ String.valueOf(response1.getBody()));
         } 
     }

     public class Oauth{
         public String access_token{get; set;}
         public String instance_url{get; set;}
         public String id{get; set;}
         public String token_type{get; set;}
         public String issued_at{get; set;}
         public String signature{get; set;}
        
     }
}