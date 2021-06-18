cp ./package.json build/
cp ./yarn.lock build/
cp ./env.yml build/
gcloud functions deploy boom-breakout-screener --source=./build --entry-point=boomBreaker --region=us-east4 --runtime=nodejs14 --timeout=540s --trigger-topic=screening-request-channel --no-allow-unauthenticated --service-account=cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com --env-vars-file=env.yml
