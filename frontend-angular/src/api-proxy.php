<?php
/**
 * Proxy a la API para evitar CORS cuando el CDN del backend no reenvía headers.
 * Las peticiones van a este script (mismo origen) y él reenvía al backend.
 */
$backend = 'https://darkorchid-lapwing-635040.hostingersite.com/api';
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
if ($path === '' && isset($_GET['path'])) {
  $path = '/' . ltrim($_GET['path'], '/');
}
if ($path === '' && !empty($_SERVER['REQUEST_URI'])) {
  $uri = strtok($_SERVER['REQUEST_URI'], '?');
  $script = basename($_SERVER['SCRIPT_NAME']);
  $pos = strpos($uri, $script);
  if ($pos !== false) {
    $path = substr($uri, $pos + strlen($script));
    $path = $path === '' || $path === false ? '' : $path;
  }
}
if ($path === '') {
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'message' => 'Missing path']);
  exit;
}

$url = rtrim($backend, '/') . $path;
if (!empty($_SERVER['QUERY_STRING'])) {
  $url .= '?' . $_SERVER['QUERY_STRING'];
}

$method = $_SERVER['REQUEST_METHOD'];
$headers = [];
foreach (getallheaders() ?: [] as $k => $v) {
  $k = strtolower($k);
  if (in_array($k, ['host', 'connection', 'content-length'], true)) continue;
  $headers[] = $k . ': ' . $v;
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
  $body = file_get_contents('php://input');
  curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($response === false) {
  http_response_code(502);
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'message' => 'Backend unreachable']);
  exit;
}

http_response_code($code);
if ($contentType) {
  header('Content-Type: ' . $contentType);
}
echo $response;
