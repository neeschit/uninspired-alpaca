cp ./package.json build/
cp ./yarn.lock build/
gcloud functions deploy cache-orchestrator --source=./build --entry-point=cacheOrchestrator --region=us-east4 --runtime=nodejs14 --timeout=540s --trigger-http --no-allow-unauthenticated --service-account=cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com
