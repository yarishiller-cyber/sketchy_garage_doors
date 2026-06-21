<?php
/**
 * form-handler.php — Sketchy Garage Doors lead handler.
 *
 * Secret-free: uses the host's built-in mail() (works on Hostinger out of the box),
 * so NO SMTP credentials live in this public repo. Handles both the contact/quote
 * form and the Become-a-Partner form (distinguished by the `kind` field).
 *
 * Progressive enhancement:
 *   - No-JS browsers POST normally  -> we 303-redirect to /thank-you.html
 *   - JS (fetch) sends Accept: application/json -> we return {"ok":true}
 *
 * Optional Supabase: if you later create a public `leads` table with an anon
 * INSERT policy, the front-end can ALSO mirror submissions there (see script.js
 * notes). This handler is the always-on, dependency-free path.
 */

header('X-Content-Type-Options: nosniff');

$INBOX = 'info@sketchygaragedoors.ca';
$wantsJson = (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

function done($ok, $wantsJson, $msg = '') {
    if ($wantsJson) {
        header('Content-Type: application/json');
        echo json_encode(array('ok' => $ok, 'message' => $msg));
    } else {
        if ($ok) {
            header('Location: /thank-you.html', true, 303);
        } else {
            header('Location: /contact.html?error=1', true, 303);
        }
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { done(false, $wantsJson, 'POST only'); }

/* Honeypot — bots fill hidden fields */
if (!empty($_POST['company_url'])) { done(true, $wantsJson, 'ok'); }

function clean($v) {
    $v = is_string($v) ? trim($v) : '';
    $v = str_replace(array("\r", "\n", "%0a", "%0d"), ' ', $v); // header-injection guard
    return substr($v, 0, 2000);
}

$kind    = clean(isset($_POST['kind']) ? $_POST['kind'] : 'contact');
$name    = clean(isset($_POST['name']) ? $_POST['name'] : '');
$email   = clean(isset($_POST['email']) ? $_POST['email'] : '');
$phone   = clean(isset($_POST['phone']) ? $_POST['phone'] : '');
$company = clean(isset($_POST['company']) ? $_POST['company'] : '');
$service = clean(isset($_POST['service']) ? $_POST['service'] : '');
$area    = clean(isset($_POST['service_area']) ? $_POST['service_area'] : '');
$message = clean(isset($_POST['message']) ? $_POST['message'] : '');
$source  = clean(isset($_POST['source_page']) ? $_POST['source_page'] : '');

if ($name === '' || ($email === '' && $phone === '')) {
    done(false, $wantsJson, 'Please include your name and a phone or email.');
}

$isPartner = ($kind === 'partner');
$subject = ($isPartner ? '[Partner application] ' : '[Website lead] ') . ($name !== '' ? $name : 'New enquiry');

$body  = "New " . ($isPartner ? "partner application" : "lead") . " from sketchygaragedoors.ca\n";
$body .= "----------------------------------------\n";
$body .= "Name:     $name\n";
if ($company) $body .= "Company:  $company\n";
$body .= "Phone:    $phone\n";
$body .= "Email:    $email\n";
if ($service) $body .= "Service:  $service\n";
if ($area)    $body .= "Area:     $area\n";
if ($message) $body .= "Message:  $message\n";
$body .= "----------------------------------------\n";
$body .= "Source:   $source\n";
$body .= "Time:     " . date('Y-m-d H:i:s') . " (server)\n";
$body .= "IP:       " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-') . "\n";

$fromAddr = $INBOX; // send as ourselves so SPF/DKIM on the domain can pass
$headers  = "From: Sketchy Garage Doors <$fromAddr>\r\n";
if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: $name <$email>\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($INBOX, $subject, $body, $headers, '-f ' . $fromAddr);

/* Even if mail() reports false on a misconfigured host, we don't want to lose the
   lead silently — but we report accurately to the JS layer so it can offer the
   mailto fallback. */
done($sent ? true : false, $wantsJson, $sent ? 'sent' : 'Mail not configured on host.');
