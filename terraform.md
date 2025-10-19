install aws
aws configure
install terraform

$Env:TF_VAR_github_token="ghp_tonTokenGitHubIci"

terraform init
terraform plan
terraform apply

% API EC2
ssh -i forum-key.pem ec2-user@63.178.45.215

curl http://63.178.45.215:3001

StatusCode : 200
StatusDescription : OK
Content : Hello World!
RawContent : HTTP/1.1 200 OK
Vary: Origin
Access-Control-Allow-Credentials: true
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 12
Content-Type: text/html; charset=utf-8
Date: Sun, 19 Oct 2025...
Forms : {}
Headers : {[Vary, Origin], [Access-Control-Allow-Credentials, true], [Connection, keep-alive], [Keep-Alive, timeout=5]...}
Images : {}
InputFields : {}
Links : {}
ParsedHtml : System.\_\_ComObject
RawContentLength : 12
