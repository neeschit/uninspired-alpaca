cp ./package.json build/
cp ./yarn.lock build/
cp ./env.yml build/
gcloud functions deploy cache-first-bar --source=./build --entry-point=cacheFirstBar --region=us-east4 --runtime=nodejs14 --timeout=540s --trigger-topic=caching-request-channel --no-allow-unauthenticated --service-account=cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com --env-vars-file=env.yml
