  rule vulnerable_openssl_version {
	strings:
		$re1 = /OpenSSL\s3\.[0-6]{1}\.[0-9]{1}[a-z]{,1}/
	
	condition:
		$re1
}
