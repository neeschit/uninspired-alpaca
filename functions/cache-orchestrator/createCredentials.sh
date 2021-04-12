gcloud iam service-accounts create cachingaccount --display-name "Cache Data Account"
gcloud projects add-iam-policy-binding fleet-tractor-309018 --member serviceAccount:cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com --role roles/cloudfunctions.invoker
gcloud projects add-iam-policy-binding fleet-tractor-309018 --member serviceAccount:cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com --role roles/logging.bucketWriter
gcloud projects add-iam-policy-binding fleet-tractor-309018 --member serviceAccount:cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com --role roles/storage.objectAdmin
gcloud projects add-iam-policy-binding fleet-tractor-309018 --member serviceAccount:cachingaccount@fleet-tractor-309018.iam.gserviceaccount.com --role roles/pubsub.publisher