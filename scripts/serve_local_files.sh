#!/usr/bin/env bash
INPUT_DIR=$1
WILDCARD=${2}
OUTPUT_FILE=${3:-"files.txt"}
PORT=${4:-8081}

echo "Usage: sh serve_local_files.sh INPUT_DIR WILDCARD OUTPUT_FILE PORT"
echo "This script scans INPUT_DIR directory with WILDCARD filter [all files by default],"
echo "generates OUTPUT_FILE [files.txt by default] with a file list,"
echo "starts web server on the port PORT [8081 by default] that serves files from INPUT_DIR"
echo

echo "Scanning ${INPUT_DIR} ..."
FIND_CMD="find ${INPUT_DIR} -type f"
if [ -z "$WILDCARD" ]; then
  echo "Files wildcard is not set. Serve all files in ${INPUT_DIR}..."
else
  FIND_CMD="${FIND_CMD} \\( "
  for ext in ${WILDCARD}; do
    FIND_CMD="${FIND_CMD} -iname \"$ext\" -o"
  done
  FIND_CMD="${FIND_CMD% -o} \\)"
fi

echo "Replacing ${INPUT_DIR} to http://localhost:${PORT} ..."
INPUT_DIR_ESCAPED=$(printf '%s\n' "$INPUT_DIR" | sed -e 's/[\/&]/\\&/g')
eval $FIND_CMD | sed "/${INPUT_DIR_ESCAPED}/s//http:\/\/localhost:${PORT}/" > $OUTPUT_FILE

green=`tput setaf 2`
reset=`tput sgr0`
echo "${green}File list stored in '${OUTPUT_FILE}'. Now import it directly from Label Studio UI${reset}"

echo "Running web server on the port ${PORT} with CORS enabled"
cd $INPUT_DIR
python3 -c "
import http.server, socketserver

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

port = $PORT
with socketserver.TCPServer(('', port), CORSRequestHandler) as httpd:
    print(f'Serving with CORS on port {port}...')
    httpd.serve_forever()
"
