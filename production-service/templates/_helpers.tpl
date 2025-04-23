{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 24 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trimSuffix "-app" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "appname" -}}
{{- $releaseName := default .Release.Name .Values.releaseOverride -}}
{{- printf "%s" $releaseName | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Get a hostname from URL
*/}}
{{- define "hostname" -}}
{{- $withpath := . | trimPrefix "http://" |  trimPrefix "https://" | trim -}}
{{- regexReplaceAllLiteral "/.*" $withpath "" | quote -}}
{{- end -}}

{{/*
Get a name from URL
*/}}
{{- define "hostnameAsName" -}}
{{- . | trimPrefix "http://" |  trimPrefix "https://" | trimSuffix "/" | trim | replace "." "-" | quote -}}
{{- end -}}

{{- define "prependServiceUrlPath" -}}
{{- $url := .url | trimPrefix "http://" |  trimPrefix "https://" | trim -}}
{{- $serviceUrlPath := regexReplaceAll "^[^/]*(/.*$)" $url "${1}" -}}
{{- $serviceUrlPath := regexReplaceAllLiteral "^/$" $serviceUrlPath "" -}}
{{- $path := .path | trimPrefix "/" -}}
{{- printf "%s/%s" $serviceUrlPath $path -}}
{{- end -}}

# This template defines unique suffix per executable component/chain.
# NOTE: at least 1 component (e.g. explorer) should not have any
# suffixes or GitLab build will fail.
{{- define "namesuffix" -}}
{{- if and .executableComponent .blockchain -}}
{{- if or (eq .executableComponent "run-explorer") (eq .executableComponent "serve")  -}}
{{- "" -}}
{{- else -}}
{{- printf "-%s-%s" .executableComponent .blockchain -}}
{{- end -}}
{{- else -}}
{{- "" -}}
{{- end -}}
{{- end -}}

{{- define "sharedlabels" -}}
app: {{ template "appname" . }}{{ template "namesuffix" . }}
chart: "{{ .Chart.Name }}-{{ .Chart.Version| replace "+" "_" }}"
release: {{ .Release.Name }}
heritage: {{ .Release.Service }}
app.kubernetes.io/name: {{ template "appname" . }}{{ template "namesuffix" . }}
helm.sh/chart: "{{ .Chart.Name }}-{{ .Chart.Version| replace "+" "_" }}"
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}{{ template "namesuffix" . }}
{{- if .Values.extraLabels }}
{{ toYaml $.Values.extraLabels }}
{{- end }}
{{- end -}}
