provider "google-beta" {
 credentials = file("./credentials.json")
 project     = "paper-trading-platform"
}