function_url=`gcloud functions describe cache-orchestrator --format="value(httpsTrigger.url)" --region=us-east4`
echo $function_url
gcloud scheduler jobs create http cache-orchestrator-job --schedule="0 21 * * *" --uri="$function_url" --oidc-service-account-email=cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com