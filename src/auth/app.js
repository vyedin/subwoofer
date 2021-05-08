const AWS = require("aws-sdk");
const jose = require("node-jose");
const fetch = require("node-fetch");

// Using lambda env vars https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
const keys_url =
        `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`;
const app_client_id = process.env.APP_CLIENT_ID;


exports.handler = async (event, context, callback) => {
    const {
      queryStringParameters: { token },
      methodArn,
    } = event;
  
    let policy;
  
    try {
      policy = await authCognitoToken(token, methodArn);
      callback(null, policy);
    } catch (error) {
      console.log(error);
      callback("Signature verification failed");
    }
  };

// Logic for splitting and verifying the token from here: 
// https://towardsdatascience.com/create-a-question-and-answer-bot-with-amazon-kendra-and-aws-fargate-79c537d68e45
const authCognitoToken = async (token, methodArn) => {
    if (!token) throw new Error("Unauthorized");

    const sections = token.split(".");
    let authHeader = jose.util.base64url.decode(sections[0]);
    authHeader = JSON.parse(authHeader);
    const kid = authHeader.kid;
    const rawRes = await fetch(keys_url);
    const response = await rawRes.json();
    if (rawRes.ok) {
        const keys = response["keys"];
        let key_index = -1;
        keys.some((key, index) => {
            if (kid == key.kid) {
                key_index = index;
            }
        });
        const foundKey = keys.find((key) => {
            return kid === key.kid;
        });

        if (!foundKey) {
            callback("Public key not found in jwks.json");
        }

        const jwkRes = await jose.JWK.asKey(foundKey);
        const verifyRes = await jose.JWS.createVerify(jwkRes).verify(token);
        const claims = JSON.parse(verifyRes.payload);

        const current_ts = Math.floor(new Date() / 1000);
        if (current_ts > claims.exp) {
            throw new Error("Token is expired");
        }

        if (claims.client_id != app_client_id) {
            throw new Error("Token was not issued for this audience");
        } else {
            return generatePolicy("me", "Allow", methodArn);
        }
    }
    throw new Error("Keys url is invalid");
};

const generatePolicy = function (principalId, effect, resource) {
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = "2012-10-17";
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = "execute-api:Invoke";
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};