#!/bin/bash -xe

SOURCE_DIRECTORY=${APPLY_CONFIG__SOURCE_DIRECTORY?Required}
DESTINATION_DIRECTORY=${APPLY_CONFIG__DESTINATION_DIRECTORY?Required}

# Parse arguments for --overwrite option
OVERWRITE_DESTINATION=${APPLY_CONFIG__OVERWRITE_DESTINATION:-false}
for arg in "$@"; do
  if [[ "$arg" == "--overwrite" ]]; then
    OVERWRITE_DESTINATION=true
  fi
done


if [ -d "$DESTINATION_DIRECTORY" ]; then
  if [ "$OVERWRITE_DESTINATION" == "true" ]; then
    echo "Destination directory <$DESTINATION_DIRECTORY> already exists. Force deleting..."
    rm -rf "$DESTINATION_DIRECTORY"
  else
    echo "Destination directory <$DESTINATION_DIRECTORY> already exists. Please delete and try again, or use --overwrite to force delete."
    exit 1
  fi
fi

mkdir -p $(dirname "$DESTINATION_DIRECTORY")
cp -r --no-target-directory "$SOURCE_DIRECTORY" "$DESTINATION_DIRECTORY"

find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_ENVIRONMENT_PLACEHOLDER\>|$APP_ENVIRONMENT|g" {} +
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_GRAPHQL_API_DOMAIN_PLACEHOLDER\>|$APP_GRAPHQL_API_DOMAIN|g" {} +
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_SENTRY_DSN_PLACEHOLDER\>|$APP_SENTRY_DSN|g" {} +
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_SENTRY_TRACES_SAMPLE_RATE_PLACEHOLDER\>|$APP_SENTRY_TRACES_SAMPLE_RATE|g" {} +
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_BING_API_KEY_PLACEHOLDER\>|$APP_BING_API_KEY|g" {} +
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_MAPBOX_API_KEY_PLACEHOLDER\>|$APP_MAPBOX_API_KEY|g" {} +
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_MAXAR_PREMIUM_API_KEY_PLACEHOLDER\>|$APP_MAXAR_PREMIUM_API_KEY|g" {} +
find "$DESTINATION_DIRECTORY" -type f -exec sed -i "s|\<APP_MAXAR_STANDARD_API_KEY_PLACEHOLDER\>|$APP_MAXAR_STANDARD_API_KEY|g" {} +

# Show diffs (Useful to debug issues)
set +xe
find "$SOURCE_DIRECTORY" -type f -printf '%P\n' | while IFS= read -r file; do
    diff -W 100 <(fold -w 100 "$SOURCE_DIRECTORY/$file") <(fold -w 100 "$DESTINATION_DIRECTORY/$file") --suppress-common-lines
done
