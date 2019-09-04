<?php
/*

php download_dukascopy_data.php
php process_dukascopy_data.php EURUSD 200702 201201 EURUSD.csv

    Copyright (C) 2009-2011 Cristi Dumitrescu <birt@eareview.net>
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Version: 0.27
*/

/***
 * To avoid excessive stress on the Dukascopy servers that provide the
 * free tick data, please enable only the symbols that you actually need.
 *
 * Scroll down for the full symbol list (the $symbols array).
 ***/

define('DOWNLOAD_ALL', false);
$extract = 'lzma -kdc -S bi5 %s';
$iswindows = false;
$tmpdir = "./tickdata";
$point = 0.001;

$download = array(
    //"EURUSD", 
    "USDJPY"
    //, "USDCHF", "USDCAD", "GBPUSD", "GBPJPY", "NZDUSD",
    // "AUDNZD", "AUDUSD", "AUDJPY", "EURCHF", "EURGBP", "EURJPY", "GBPCHF",
    );

$symbols = array(
    "EURUSD" => 1175270400, // starting from 2007.03.30 16:00
    "AUDNZD" => 1229961600, // starting from 2008.12.22 16:00
    "AUDUSD" => 1175270400, // starting from 2007.03.30 16:00
    "AUDJPY" => 1175270400, // starting from 2007.03.30 16:00
    "EURCHF" => 1175270400, // starting from 2007.03.30 16:00
    "EURGBP" => 1175270400, // starting from 2007.03.30 16:00
    "EURJPY" => 1175270400, // starting from 2007.03.30 16:00
    "GBPCHF" => 1175270400, // starting from 2007.03.30 16:00
    "GBPJPY" => 1175270400, // starting from 2007.03.30 16:00
    "GBPUSD" => 1175270400, // starting from 2007.03.30 16:00
    "NZDUSD" => 1175270400, // starting from 2007.03.30 16:00
    "USDCAD" => 1175270400, // starting from 2007.03.30 16:00
    "USDCHF" => 1175270400, // starting from 2007.03.30 16:00

	//OK
    //"USDJPY" => '2003-05-04 21:00:00', //1175270400, // starting from 2007.03.30 16:00
    "USDJPY" => '2016-03-01 01:00:00', //1175270400, // starting from 2007.03.30 16:00
    "CADJPY" => 1175270400, // starting from 2007.03.30 16:00
    "EURAUD" => 1175270400, // starting from 2007.03.30 16:00
    "CHFJPY" => 1175270400, // starting from 2007.03.30 16:00
    "EURCAD" => 1222167600, // starting from 2008.09.23 11:00
    "EURNOK" => 1175270400, // starting from 2007.03.30 16:00
    "EURSEK" => 1175270400, // starting from 2007.03.30 16:00
    "USDNOK" => 1222639200, // starting from 2008.09.28 22:00
    "USDSEK" => 1222642800, // starting from 2008.09.28 23:00
    "USDSGD" => 1222642800, // starting from 2008.09.28 23:00
    "AUDCAD" => 1266318000, // starting from 2010.02.16 11:00
    "AUDCHF" => 1266318000, // starting from 2010.02.16 11:00
    "CADCHF" => 1266318000, // starting from 2010.02.16 11:00
    "EURNZD" => 1266318000, // starting from 2010.02.16 11:00
    "GBPAUD" => 1266318000, // starting from 2010.02.16 11:00
    "GBPCAD" => 1266318000, // starting from 2010.02.16 11:00
    "GBPNZD" => 1266318000, // starting from 2010.02.16 11:00
    "NZDCAD" => 1266318000, // starting from 2010.02.16 11:00
    "NZDCHF" => 1266318000, // starting from 2010.02.16 11:00
    "NZDJPY" => 1266318000, // starting from 2010.02.16 11:00
    "XAGUSD" => 1289491200, // starting from 2010.11.11 16:00
    "XAUUSD" => 1305010800, // starting from 2011.05.10 07:00
    );


/*
decode_ducascopy_bi5('/home/nodejs/fxdata/fxdata.dat', $outfd_m, 1175270400)
fclose($outfd_m);
    exit(0);
*/

if($argc > 1 && $argv[1] == 'get') {
	mainget();
}
else if($argc > 1 && $argv[1] == 'add') {
	mainadd();
}
else {
	echo 'need add or get';
}
function mainget() {
    global $extract, $iswindows, $tmpdir, $download, $symbols;
	//@unlink($tmpdir);
	@mkdir($tmpdir);
	foreach($symbols as $symbol => $firsttick) {
		if (!DOWNLOAD_ALL && !in_array($symbol, $download)) {
			continue;
		}
		if(is_string($firsttick)) {
			$firsttick = strtotime($firsttick);
		}
		mainget2($symbol, $firsttick);
		break;
	}
	@rmdir($tmpdir);
}

function mainadd() {
    global $extract, $iswindows, $tmpdir, $download, $symbols;
	foreach($symbols as $symbol => $firsttick) {
		if (!DOWNLOAD_ALL && !in_array($symbol, $download)) {
			continue;
		}
		if(is_string($firsttick)) {
			$firsttick = strtotime($firsttick);
		}
		$outfile = './fx-'.$symbol.'.csv';
		@unlink($outfile);
		$outfd_m = fopen($outfile, 'w');
		if ($outfd_m === FALSE) {
			echo "Cannot open $outfile for writing.\n";
			exit(1);
		}

		$firsttick -= $firsttick % 3600;
		for($i = $firsttick; $i < time(); $i += 3600) {
			$year = gmstrftime('%Y',$i);
			$month = str_pad(gmstrftime('%m',$i) - 1, 2, '0', STR_PAD_LEFT);
			$day = gmstrftime('%d',$i);
			$hour = gmstrftime('%H',$i);
			$localpath = "$symbol/$year/$month/$day/";
			$localfile2 = $localpath . $hour . "h_ticks.csv";
			if (file_exists($localfile2)) {
				echo "add:$localfile2\r\n";
				$txt = file_get_contents($localfile2);
				fwrite($outfd_m, $txt);
			}
		}
		fclose($outfd_m);
	}
}

function mainget2($symbol, $firsttick) {
    global $extract, $iswindows, $tmpdir, $download, $symbols;
	$g_cnt = 0;
    $firsttick -= $firsttick % 3600;
    error("Info: Downloading $symbol starting with ".gmstrftime("%m/%d/%y %H:%M:%S",$firsttick)."\n");
    for($i = $firsttick; $i < time(); $i += 3600) {
		$g_cnt++;
		if($g_cnt > 10) {
			$g_cnt = 0;
			//0.3sec
			sleep(1);
		}
        $year = gmstrftime('%Y',$i);
        $month = str_pad(gmstrftime('%m',$i) - 1, 2, '0', STR_PAD_LEFT);
        $day = gmstrftime('%d',$i);
        $hour = gmstrftime('%H',$i);
        $url = "http://www.dukascopy.com/datafeed/$symbol/$year/$month/$day/{$hour}h_ticks.bi5";
        $localpath = "$symbol/$year/$month/$day/";
        $binlocalfile = $localpath . $hour . "h_ticks.bin";
        $localfile = $localpath . $hour . "h_ticks.bi5";
        $localfile2 = $localpath . $hour . "h_ticks.csv";
        if (!file_exists($localpath)) {
            mkdir($localpath, 0777, true);
        }
        if (file_exists($localfile) && file_exists($localfile2)) {
			@unlink($localfile);
			echo "remove $localfile\r\n";
		}
        if (!file_exists($localfile) && !file_exists($binlocalfile) && !file_exists($localfile2)) {
			error("Info: Processing $symbol $i - ".gmstrftime("%m/%d/%y %H:%M:%S",$i)." --- $url\n");
            $ch = FALSE;
            $j = 0;
            do {
                if ($ch !== FALSE) {
                    curl_close($ch);
                }
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
                curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
                curl_setopt($ch, CURLOPT_HEADER, 0);
				//curl_setopt($ch, CURLOPT_PROXY, 'proxy-oji01.jpn.hp.com:8080');
                $result = curl_exec($ch);
                $j++;
            } while ($j <= 3 && curl_errno($ch));
            if (curl_errno($ch)) {
                error("FATAL: Couldn't download $url.\nError was: ".curl_error($ch)."\n");
                exit(1);
            }
            else {
                if (curl_getinfo($ch, CURLINFO_HTTP_CODE) == 404) {
                    // file not found
                    $weekday = gmstrftime('%a',$i);
                    if (strcasecmp($weekday,'sun') == 0 || strcasecmp($weekday,'sat') == 0) {
                        // ignore missing weekend files
                        //error("Info: missing weekend file $url\n");
                    }
                    else {
                        error("WARNING: missing file $url ($i - ".gmstrftime("%m/%d/%y %H:%M GMT",$i).")\n");
                    }
                }
                else if (curl_getinfo($ch, CURLINFO_HTTP_CODE) == 200) {
                    $outfd = fopen($localfile, 'wb');
                    if ($outfd === FALSE) {
                        error("FATAL: Couldn't open $localfile ($url - $i)\n");
                        exit(1);
                    }
                    fwrite($outfd, $result);
                    fclose($outfd);
                    //error("Info: successfully downloaded $url\n");

				    if (filesize($localfile) > 0) {
						$g_cnt = 0;
				        decode_ducascopy_bi5($localfile, $localfile2, $i);
						if(file_exists($localfile2)) {
							@unlink($localfile);
						}
				    }
				    else {
				        echo "Warning: 0 sized $localfile\n";
				    }

                }
                else {
                    error("WARNING: did not download $url ($i - ".gmstrftime("%m/%d/%y %H:%M GMT",$i).") - error code was ".curl_getinfo($ch, CURLINFO_HTTP_CODE)."\nContent was: $result\n");
                }
            }
            curl_close($ch);
        }
        else {
            //error("Info: skipping $url, local file already exists.\n");
        }
    }
}

function error($error) {
    echo $error;
    $fd = fopen('error.log', 'a+');
    fwrite($fd, $error);
    fclose($fd);
}

function decode_ducascopy_bin($fname, $outfd) {
    print "$fname\n";
    $zip = new ZipArchive;
    $res = $zip->open($fname);
    if ($res!==true) {
        echo "Error: failed to open [$fname] code [$res]\n";
        exit(1);
    }
    $binname = $zip->getNameIndex(0);
    global $tmpdir;
    $res = $zip->extractTo($tmpdir, $binname);
    if (!$res) {
        echo "Error: unable to extract from zip archive\n";
        exit(1);
    }
    $bin = file_get_contents($tmpdir.'/'.$binname);
    if (strlen($bin) == 0) {
        echo "Error: unable to read extracted file\n";
        exit(1);
    }
    unlink($tmpdir.'/'.$binname);
    $idx = 0;
    $size = strlen($bin);
    while($idx < $size) {
        //print "$idx $size\n";
        $q = unpack('@'.$idx.'/n4', $bin);
        $time = bcmul('4294967296', bcadd($q['2'],bcmul($q['1'],65536)));
        $time = bcadd($time, bcadd($q['4'],bcmul($q['3'],65536)));
        $timesec = bcdiv($time, 1000);
        $timems = bcmod($time, 1000);

        $q = unpack('@'.($idx + 8)."/N2", $bin);
        $s = pack('V2', $q[2], $q[1]);
        $q = unpack('d', $s);
        $ask = $q[1];

        $q = unpack('@'.($idx + 16)."/N2", $bin);
        $s = pack('V2', $q[2], $q[1]);
        $q = unpack('d', $s);
        $bid = $q[1];

        $q = unpack('@'.($idx + 24)."/N2", $bin);
        $s = pack('V2', $q[2], $q[1]);
        $q = unpack('d', $s);
        $askvol = $q[1];

        $q = unpack('@'.($idx + 32)."/N2", $bin);
        $s = pack('V2', $q[2], $q[1]);
        $q = unpack('d', $s);
        $bidvol = $q[1];

        if ($bid == intval($bid)) {
            $bid = number_format($bid, 1, '.', '');
        }
        if ($ask == intval($ask)) {
            $ask = number_format($ask, 1, '.', '');
        }
        fwrite($outfd, gmstrftime("%Y.%m.%d %H:%M:%S", $timesec).".".str_pad($timems,3,'0',STR_PAD_LEFT).",$bid,$ask,".number_format($bidvol,0,'','').",".number_format($askvol,0,'','')."\n");

        $idx += 40;
    }
}

function decode_ducascopy_bi5($fname, $localfile2, $hourtimestamp) {
    print "$fname\n";
    global $iswindows, $extract, $tmpdir, $point;
    if ($iswindows) {
        $cmd = sprintf($extract, $tmpdir, $fname);
        shell_exec($cmd);
        $extracted = $tmpdir.'\\'.substr($fname, strrpos($fname, '/') + 1);
        $extracted = substr($extracted, 0, strrpos($extracted, '.'));
        if (!file_exists($extracted)) {
            echo "Error: failed to extract [$fname]\n";
            exit(1);
        }
        $bin = file_get_contents($extracted);
        unlink($extracted);
    }
    else {
        $cmd = sprintf($extract, $fname);
        $bin = shell_exec($cmd);
    }
    if (strlen($bin) == 0) {
        echo "Error: unable to read extracted file\n";
        exit(1);
    }
    $idx = 0;
    $size = strlen($bin);

	$outfd_m = fopen($localfile2, 'w');
	if ($outfd_m === FALSE) {
	    echo "Cannot open $outfile for writing.\n";
	    exit(1);
	}

    $ymd_l = '';
    $hh_l = '';
    $mi_l = '';
    $se_l = '';
    while($idx < $size) {
        //print "$idx $size\n";
        $q = unpack('@'.$idx.'/N', $bin);
        $deltat = $q[1];
        $timesec = $hourtimestamp + $deltat / 1000;
        $timems = $deltat % 1000;

        $q = unpack('@'.($idx + 4)."/N", $bin);
        $ask = $q[1] * $point;
        $q = unpack('@'.($idx + 8)."/N", $bin);
        $bid = $q[1] * $point;
        $q = unpack('@'.($idx + 12)."/C4", $bin);
        $s = pack('C4', $q[4], $q[3], $q[2], $q[1]);
        $q = unpack('f', $s);
        $askvol = $q[1];
        $q = unpack('@'.($idx + 16)."/C4", $bin);
        $s = pack('C4', $q[4], $q[3], $q[2], $q[1]);
        $q = unpack('f', $s);
        $bidvol = $q[1];

        if ($bid == intval($bid)) {
            $bid = number_format($bid, 1, '.', '');
        }
        if ($ask == intval($ask)) {
            $ask = number_format($ask, 1, '.', '');
        }
        fwrite($outfd_m, gmstrftime("%Y%m%d %H%M%S", $timesec).".".str_pad($timems,3,'0',STR_PAD_LEFT).",$bid,$ask,".number_format($bidvol,2,'.','').",".number_format($askvol,2,'.','')."\n");
        /*
		$ymdout = '';
		$ymdfull = gmstrftime("%Y%m%d %H%M%S", $timesec);
		$ymd = substr($ymdfull, 0, 8);
        $hh = substr($ymdfull, 9, 2);
        $mi = substr($ymdfull, 11, 2);
        $se = substr($ymdfull, 13, 2);
		if($ymd_l != $ymd) {
			$ymdout = gmstrftime("%Y%m%d %H%M%S", $timesec);
			$ymd_l = $ymd;
		    $hh_l = $hh;
		    $mi_l = $mi;
		    $se_l = $se;
        }
        else if($hh_l != $hh) {
			$ymdout = gmstrftime("%H%M%S", $timesec);
		    $hh_l = $hh;
		    $mi_l = $mi;
		    $se_l = $se;
        }
        else if($mi_l != $mi) {
			$ymdout = gmstrftime("%M%S", $timesec);
		    $mi_l = $mi;
		    $se_l = $se;
        }
        else if($se_l != $se) {
			$ymdout = gmstrftime("%S", $timesec);
		    $se_l = $se;
        }
        //$ask2 = $ask-$bid;
        fwrite($outfd_m, $ymdout.".".str_pad($timems,3,'0',STR_PAD_LEFT).",$bid,$ask,".number_format($bidvol,2,'.','').",".number_format($askvol,2,'.','')."\n");
        */
        $idx += 20;
    }

	fclose($outfd_m);

}
