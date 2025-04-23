#!/usr/bin/env bash
set -eo pipefail

# Set this variable to any value to skip the check.
readonly ALLOW_DEPLOY_TO_ACTIVE_BACKEND

main() {
    if [[ -n $ALLOW_DEPLOY_TO_ACTIVE_BACKEND ]]; then
        echo 'WARNING: variable ALLOW_DEPLOY_TO_ACTIVE_BACKEND is set. '`
            `'Check of the active backend will be skipped
        exit 0
    fi

    local -r color=$1
    local -r prod_color=$(get_prod_color)

    if [[ -z $prod_color ]]; then
        echo -e >&2 \
            'ERROR: unable to get the active backend color!\n'`
           `'You can set the ALLOW_DEPLOY_TO_ACTIVE_BACKEND variable to any value to skip the check'
        exit 1
    fi
    printf 'Active backend: %s\n' "$prod_color"

    if [[ $color == "$prod_color" ]]; then
        echo -e >&2 \
            'ERROR: deploying to the active backend is not allowed!\n'`
           `'To skip this check set the ALLOW_DEPLOY_TO_ACTIVE_BACKEND variable to any value'
        exit 1
    fi
    exit 0
}

get_prod_color() {
    local -r external_name=$(kubectl get service \
    -n sdaf-cwap-production-services \
    -o jsonpath='{.items[0].spec.externalName}' \
    | grep -Eo 'production-sdaf-backend-service[^"]*'
    )
    echo "${external_name%-sdaf-backend-service.*}"
}

main "$@"
