function Packer() {
	//#region Private
	
	var regExpSanityFirstCapital = new RegExp("^[A-Z]");
	
	var tables = new Tables();
	
	// Input is in the format key1=value1&key2=value2&etc...
	// Output is packed in same format
	// Adds one additional key=value pair for pack version
	var packAll = function(uriParamString, verbose)
	{
		// Split up all keyValuePairs and create an array to contain all packed ones
		var dataArray = uriParamString.split("&");
		var packedArray = new Array(dataArray.length);
		/*
		// Sanity check for Capital letters at start;
		for (var i = 0; i < dataArray.length; i++) {
			var faulty = dataArray[i].match(regExpSanityFirstCapital) != null
			
			console.assert(!faulty, "packAll: Found key with upper case:", dataArray[i], "exiting");
			
			if( faulty )
			{
				// Incorrect uriParamString passed faulty run exit
				return null;
			}
		}
		*/
		for (var i = 0; i < dataArray.length; i++) {
			var pair = packKeyValuePair(dataArray[i], verbose)
			packedArray[i] = pair.key + pair.value;
		}
		
		var packedData = packedArray.join("&");
		
		if (verbose)
		{
			console.log("packAll:	input:", uriParamString.length ,"	output	:", packedData.length);
		}
		
		return packedData;
	}

	var unpackAll = function(uriParameters, verbose)
	{
		// Split up all packed keyValuePairs and create an array to contain all unpacked ones
		var dataArray = uriParameters.split("&");
		var unpackedArray = new Array(dataArray.length);
		/*
		// Sanity check for Capital letters at start;
		for (var i = 0; i < dataArray.length; i++) {
			var faulty = dataArray[i].match(regExpSanityFirstCapital) == null
			
			console.assert(!faulty, "unpackAll: Found key with lower case:", dataArray[i], "exiting");
			
			if( faulty )
			{
				// Incorrect uriParamString passed faulty run exit
				return null;
			}
		}
		*/
		for (var i = 0; i < dataArray.length; i++) { 
			unpackedArray[i] = unpackKeyValuePair(dataArray[i], verbose);
		}
		
		var unpackedData = unpackedArray[0].key + "=" + unpackedArray[0].value;
		for (var i = 1; i < unpackedArray.length; i++) {
			unpackedData += "&" + unpackedArray[i].key + "=" + unpackedArray[i].value;
		}
		
		if(verbose)
		{
			console.log("unpackAll:	input:", uriParameters.length, "	output	:", unpackedData.length);
		}
		
		return unpackedData;
	}

	var unpackKeyValuePair = function(keyValuePair, verbose)
	{
		var pair = deformatKey(keyValuePair, verbose);
		
		return pair;
	}

	var packKeyValuePair = function(keyValuePair, verbose)
	{
		var oldPair = splitKeyValuePair(keyValuePair, verbose)
		var pair = splitKeyValuePair(keyValuePair, verbose);
		pair = formatKey(pair, verbose);
		pair = formatNumber(pair, oldPair, verbose);
		pair = formatValue(pair, verbose);
		
		if(pair.convert == null)
		{
			// We have not done any packing so leave the = sign.
			pair["value"] = "=" + pair.value;
		}
		
		return pair;
	}

	var deformatKey = function(keyValuePair, verbose)
	{
		var packedPair = getKeyValueObj(keyValuePair, "", null);
		packedPair = loopArraysAndReplace("Beginning", packedPair, "key", ".+", 6, 3, 2, verbose);
		packedPair = deformatNumber(packedPair, verbose);
		var pair = deformatValue(packedPair, verbose);
		
		return pair;
	}

	var formatKey = function(pair, verbose)
	{
		pair = loopArraysAndReplace("Beginning", pair, "key", ".+", 0, 0, 3, verbose);

		return pair;
	}

	var deformatNumber = function(pair, verbose)
	{
		if (pair.convert != null)
		{
			if (Number(pair.convert[4]) != 0)
			{
				var table;
				var numberCount = 0;
				if( pair.convert[4] == 1 )
				{
					table = tables.getTable("NumberShort");
					numberCount = 1;
				}
				else if ( pair.convert[4] == -2 )
				{
					table = tables.Number();
					numberCount = 2;
				}
				else
				{
					console.err("Something wrong, unable to figure out number table");
				}
				
				var match = pair.key.match("^(" + pair.convert[2].replace("*",".") + ")([0-9A-Za-z]{" + numberCount + "})(.+)");
				var newPair = null;
				if(pair.convert[4] == 1)
				{
					var newNumber = table.indexOf(match[2]);
					newPair = getKeyValueObj(match[1].replace("*", newNumber), match[3], pair.convert);
				}
				else if(pair.convert[4] == -2)
				{
					var combinedNumber = table.indexOf(match[2]);
					var firstNumber = combinedNumber;
					var secondNumber = 0;
					
					if ( combinedNumber > 9 )
					{
						var combinedString = combinedNumber.toString();
						firstNumber = combinedString.substring(combinedString.length - 1);
						secondNumber = combinedString.substring(0, combinedString.length - 1);
					}
					
					var newKey = match[1].replace("*", firstNumber);
					newKey = newKey.replace("*", secondNumber);
					
					newPair = getKeyValueObj(newKey, match[3], pair.convert);
				}
				else
				{
					pair.key = pair.key + "~" + match.length + "~U~" + pair.convert[4] + "~";
					console.err("Not Implemented:" + pair.key + "~" + match.length + "~U~" + pair.convert[4] + "~");
				}
			
				return newPair;
			}
			else
			{
				// Do split of key / value
				var match = pair.key.match("(" + pair.convert[0] + ")(.+)");
				return getKeyValueObj(match[1], match[2], pair.convert);
			}
		}
		else
		{
			if (pair.key.indexOf("=") > 0)
			{
				return splitKeyValuePair(pair.key);
			}
			
			return pair;
		}
	}
	
	var formatNumber = function(pair, oldPair, verbose)
	{
		if (pair.convert != null && pair.convert[1].length > 0)
		{
			var table;
			if( pair.convert[4] == 1 )
			{
				table = tables.getTable("NumberShort");
			}
			else if ( pair.convert[4] == 2 || pair.convert[4] == -2 )
			{
				table = tables.Number();
			}
			else
			{
				console.err("Something wrong");
			}
			
			var match = oldPair.key.match(pair.convert[1]);
			if(match.length == 2 && pair.convert[4] == 1)
			{
				pair.key = pair.key + table[Number(match[1])];
			}
			else if(match.length == 3 && pair.convert[4] == -2)
			{
				if (match[2] == 0)
				{
					pair.key = pair.key + table[Number(match[1])];
				}
				else
				{
					pair.key = pair.key + table[Number(match[2] + match[1])];
				}
			}
			else
			{
				pair.key = pair.key + "~" + match.length + "~U~" + pair.convert[4] + "~";
				console.err("Not Implemented:" + pair.key + "~" + match.length + "~U~" + pair.convert[4] + "~");
			}
		}
		
		return pair;
	}

	var deformatValue = function(pair, verbose)
	{
		if (pair.convert != null)
		{
			switch(pair.convert[5]) {
				case 1: // Unpack the value if it is a boolean
					return loopArraysAndReplace("Boolean", pair, "value", ".+", 3, 3, 1, verbose);
					
				case 2: // Unpack "STR,DEX,CON,INT,WIS,CHA"
					return loopArraysAndReplace("Stats", pair, "value", ".+", 3, 3, 1, verbose);
					
				case 3: // Unpack "Light, Medium, Heavy"
					return loopArraysAndReplace("ArmorType", pair, "value", ".+", 3, 3, 1, verbose);
					
				case 4: // Unpack "personal, touch, close, medium, long"
					return loopArraysAndReplace("Range", pair, "value", ".+", 3, 3, 1, verbose);
					
				default: // Do some restoration of data.
					return decodeSpacesFromUnderscore(pair, verbose);
			}
		}
		
		return decodeSpacesFromUnderscore(pair, verbose);
	}

	var formatValue = function(pair, verbose)
	{
		if(pair.convert != null)
		{
			switch(pair.convert[5]) {
				case 1: // Pack the value if it is a boolean
					return loopArraysAndReplace("Boolean", pair, "value", ".+", 0, 1, 2, verbose);
					
				case 2: // Pack "STR,DEX,CON,INT,WIS,CHA"
					return loopArraysAndReplace("Stats", pair, "value", ".+", 0, 1, 2, verbose);
					
				case 3: // Pack "Light, Medium, Heavy"
					return loopArraysAndReplace("ArmorType", pair, "value", ".+", 0, 1, 2, verbose);
					
				case 4: // Pack "personal, touch, close, medium, long"
					return loopArraysAndReplace("Range", pair, "value", ".+", 0, 1, 2, verbose);
					
				default: // Do some cleanup of data.
					return encodeSpacesToUnderscores(pair, verbose);
			}
		}
		
		return encodeSpacesToUnderscores(pair, verbose);
	}
	
	var decodeSpacesFromUnderscore = function(pair, verbose)
	{
		var value = pair.value;
		
		// unescape ~_ to ~U~
		value = value.replace(new RegExp("~_", 'g'), "~U~");
		// restore _ to %20
		value = value.replace(new RegExp('_', 'g'), "%20");
		// restore ~U~ to _
		value = value.replace(new RegExp("~U~", 'g'), '_');
		// unescape ~ from ~~
		value = value.replace(new RegExp("~~", 'g'), '~');
		
		pair["value"] = value;
		return pair;
	}
	
	var encodeSpacesToUnderscores = function(pair, verbose)
	{
		var value = pair.value;
		
		value = value.replace(new RegExp("^(%0A|%20| )+"), ""); // Leading
		value = value.replace(new RegExp("(%0A|%20| )+$"), ""); // Trailing
		
		// escape ~ with ~~
		value = value.replace(new RegExp('~', 'g'), "~~");
		// escape _ to ~_
		value = value.replace(new RegExp('_', 'g'), "~_");
		// replace %20 or <space> to _
		value = value.replace(new RegExp("%20| ", 'g'), '_');
		
		pair["value"] = value;
		return pair;
	}
	
	var loopArraysAndReplace = function(tableName, pair, change, validateKey, iMatch, iReplace, iWith, verbose)
	{
		if( pair.key.match(new RegExp(validateKey)) )
		{
			var table = tables.getTable(tableName);
			
			if(change == "key")
			{
				for (var i = 0; i < table.length; i++) {
					if( pair.key.match(table[i][iMatch]) )
					{
						//var sanity = pair.key.match(table[i][iReplace]);
						pair["key"] = pair.key.replace(new RegExp(table[i][iReplace]), table[i][iWith]);
						pair["convert"] = table[i];
						return pair;
					}
				}
			}
			else if (change == "value")
			{
				for (var i = 0; i < table.length; i++) {
					if( pair.value.match(table[i][iMatch]) )
					{
						// var sanity = pair.value.match(table[i][iReplace]);
						pair["value"] = pair.value.replace(new RegExp(table[i][iReplace]), table[i][iWith]);
						return pair;
					}
				}
			}
		}

		return pair;
	}

	var splitKeyValuePair = function(keyValue, verbose)
	{
		var keyValueArray = keyValue.match('^([^=]+)=(.+)$');
		
		return getKeyValueObj(keyValueArray[1], keyValueArray[2], null);
	}
	
	var getKeyValueObj = function(keyPair, valuePair, convertPair)
	{
		var keyValuePair = {
			key: keyPair,
			value: valuePair,
			convert: convertPair
		};

		return keyValuePair;
	}
	
	function Tables()
	{
		var VERSION_1 = "cpv1";
		var VERSION_CURRENT = VERSION_1;
		
		this.setVersion = function(version)
		{
			VERSION_CURRENT = version;
		}
		
		this.getTable = function(name)
		{
			var Beginning = {};
			Beginning[VERSION_1] = [
				// Ordering, longest first
				// Last int in array
				// Index 4: Positive number says how many characters are used to encode the number.
				// Index 4: Negative is a special formula always
				// Index 4: Spells have -2 that is 2 numbers and coded to 2 characters. [Slell] append [Caster]
				// Index 5: Tells what to do with the value
['^skill\\.use%20magic%20device\\.is-class','','skill.use%20magic%20device.is-class','Dk',0,1,'^Dk'],
['^skill\\.sleight%20of%20hand\\.is-class','','skill.sleight%20of%20hand.is-class','CQ',0,1,'^CQ'],
['^info\\.homeland%20and%20occupation','','info.homeland%20and%20occupation','AJ',0,0,'^AJ'],
['^skill\\.use%20magic%20device\\.ranks','','skill.use%20magic%20device.ranks','Dl',0,0,'^Dl'],
['^skill\\.disable%20device\\.is-class','','skill.disable%20device.is-class','BY',0,1,'^BY'],
['^skill\\.sleight%20of%20hand\\.ranks','','skill.sleight%20of%20hand.ranks','CR',0,0,'^CR'],
['^skill\\.use%20magic%20device\\.misc','','skill.use%20magic%20device.misc','Dm',0,0,'^Dm'],
['^skill\\.use%20magic%20device\\.temp','','skill.use%20magic%20device.temp','Dn',0,0,'^Dn'],
['^skill\\.escape%20artist\\.is-class','','skill.escape%20artist.is-class','Cg',0,1,'^Cg'],
['^skill\\.handle%20animal\\.is-class','','skill.handle%20animal.is-class','Co',0,1,'^Co'],
['^skill\\.sleight%20of%20hand\\.misc','','skill.sleight%20of%20hand.misc','CS',0,0,'^CS'],
['^skill\\.sleight%20of%20hand\\.temp','','skill.sleight%20of%20hand.temp','CT',0,0,'^CT'],
['^skill\\.sense%20motive\\.is-class','','skill.sense%20motive.is-class','CM',0,1,'^CM'],
['^skill\\.disable%20device\\.ranks','','skill.disable%20device.ranks','BZ',0,0,'^BZ'],
['^skill\\.disable%20device\\.misc','','skill.disable%20device.misc','Cb',0,0,'^Cb'],
['^skill\\.disable%20device\\.temp','','skill.disable%20device.temp','Ca',0,0,'^Ca'],
['^skill\\.escape%20artist\\.ranks','','skill.escape%20artist.ranks','Ch',0,0,'^Ch'],
['^skill\\.handle%20animal\\.ranks','','skill.handle%20animal.ranks','Cp',0,0,'^Cp'],
['^skill\\.escape%20artist\\.misc','','skill.escape%20artist.misc','Cj',0,0,'^Cj'],
['^skill\\.escape%20artist\\.temp','','skill.escape%20artist.temp','Ci',0,0,'^Ci'],
['^skill\\.handle%20animal\\.misc','','skill.handle%20animal.misc','Cr',0,0,'^Cr'],
['^skill\\.handle%20animal\\.temp','','skill.handle%20animal.temp','Cq',0,0,'^Cq'],
['^skill\\.linguistics\\.is-class','','skill.linguistics.is-class','CA',0,1,'^CA'],
['^skill\\.sense%20motive\\.ranks','','skill.sense%20motive.ranks','CN',0,0,'^CN'],
['^load\\.medium\\.skill-penalty','','load.medium.skill-penalty','Ba',0,0,'^Ba'],
['^skill\\.acrobatics\\.is-class','','skill.acrobatics.is-class','BE',0,1,'^BE'],
['^skill\\.intimidate\\.is-class','','skill.intimidate.is-class','Cw',0,1,'^Cw'],
['^skill\\.perception\\.is-class','','skill.perception.is-class','CE',0,1,'^CE'],
['^skill\\.sense%20motive\\.misc','','skill.sense%20motive.misc','CO',0,0,'^CO'],
['^skill\\.sense%20motive\\.temp','','skill.sense%20motive.temp','CP',0,0,'^CP'],
['^skill\\.spellcraft\\.is-class','','skill.spellcraft.is-class','CU',0,1,'^CU'],
['^load\\.heavy\\.skill-penalty','','load.heavy.skill-penalty','AW',0,0,'^AW'],
['^skill\\.diplomacy\\.is-class','','skill.diplomacy.is-class','BU',0,1,'^BU'],
['^armor\\.medium\\.base-speed','','armor.medium.base-speed','Al',0,0,'^Al'],
['^skill\\.appraise\\.is-class','','skill.appraise.is-class','BI',0,1,'^BI'],
['^skill\\.disguise\\.is-class','','skill.disguise.is-class','Cc',0,1,'^Cc'],
['^skill\\.linguistics\\.ranks','','skill.linguistics.ranks','CC',0,0,'^CC'],
['^skill\\.survival\\.is-class','','skill.survival.is-class','Dc',0,1,'^Dc'],
['^armor\\.heavy\\.base-speed','','armor.heavy.base-speed','Aj',0,0,'^Aj'],
['^load\\.medium\\.base-speed','','load.medium.base-speed','AY',0,0,'^AY'],
['^skill\\.acrobatics\\.ranks','','skill.acrobatics.ranks','BG',0,0,'^BG'],
['^skill\\.custom[0-9]+\\.is-class','([0-9]+)','skill.custom*.is-class','Er',1,1,'^Er'],
['^skill\\.intimidate\\.ranks','','skill.intimidate.ranks','Cy',0,0,'^Cy'],
['^skill\\.linguistics\\.misc','','skill.linguistics.misc','CB',0,0,'^CB'],
['^skill\\.linguistics\\.temp','','skill.linguistics.temp','CD',0,0,'^CD'],
['^skill\\.perception\\.ranks','','skill.perception.ranks','CG',0,0,'^CG'],
['^skill\\.spellcraft\\.ranks','','skill.spellcraft.ranks','CW',0,0,'^CW'],
['^skill\\.stealth\\.is-class','','skill.stealth.is-class','CY',0,1,'^CY'],
['^load\\.heavy\\.base-speed','','load.heavy.base-speed','AU',0,0,'^AU'],
['^load\\.light\\.base-speed','','load.light.base-speed','AX',0,0,'^AX'],
['^skill\\.acrobatics\\.misc','','skill.acrobatics.misc','BF',0,0,'^BF'],
['^skill\\.acrobatics\\.temp','','skill.acrobatics.temp','BH',0,0,'^BH'],
['^skill\\.craft[0-9]+\\.is-class','([0-9]+)','skill.craft*.is-class','El',1,1,'^El'],
['^skill\\.custom[0-9]+\\.ability','([0-9]+)','skill.custom*.ability','Ep',1,2,'^Ep'],
['^skill\\.diplomacy\\.ranks','','skill.diplomacy.ranks','BW',0,0,'^BW'],
['^skill\\.intimidate\\.misc','','skill.intimidate.misc','Cx',0,0,'^Cx'],
['^skill\\.intimidate\\.temp','','skill.intimidate.temp','Cz',0,0,'^Cz'],
['^skill\\.perception\\.misc','','skill.perception.misc','CF',0,0,'^CF'],
['^skill\\.perception\\.temp','','skill.perception.temp','CH',0,0,'^CH'],
['^skill\\.spellcraft\\.misc','','skill.spellcraft.misc','CV',0,0,'^CV'],
['^skill\\.spellcraft\\.temp','','skill.spellcraft.temp','CX',0,0,'^CX'],
['^load\\.stagger\\.max-dex','','load.stagger.max-dex','Bc',0,0,'^Bc'],
['^shield\\.skill-penalty','','shield.skill-penalty','BB',0,0,'^BB'],
['^skill\\.appraise\\.ranks','','skill.appraise.ranks','BK',0,0,'^BK'],
['^skill\\.bluff\\.is-class','','skill.bluff.is-class','BM',0,1,'^BM'],
['^skill\\.climb\\.is-class','','skill.climb.is-class','BQ',0,1,'^BQ'],
['^skill\\.diplomacy\\.misc','','skill.diplomacy.misc','BV',0,0,'^BV'],
['^skill\\.diplomacy\\.temp','','skill.diplomacy.temp','BX',0,0,'^BX'],
['^skill\\.disguise\\.ranks','','skill.disguise.ranks','Ce',0,0,'^Ce'],
['^skill\\.perf[0-9]+\\.is-class','([0-9]+)','skill.perf*.is-class','EB',1,1,'^EB'],
['^skill\\.prof[0-9]+\\.is-class','([0-9]+)','skill.prof*.is-class','EG',1,1,'^EG'],
['^skill\\.survival\\.ranks','','skill.survival.ranks','De',0,0,'^De'],
['^armor\\.skill-penalty','','armor.skill-penalty','Am',0,0,'^Am'],
['^load\\.medium\\.max-dex','','load.medium.max-dex','AZ',0,0,'^AZ'],
['^skill\\.appraise\\.misc','','skill.appraise.misc','BJ',0,0,'^BJ'],
['^skill\\.appraise\\.temp','','skill.appraise.temp','BL',0,0,'^BL'],
['^skill\\.custom[0-9]+\\.categ','([0-9]+)','skill.custom*.categ','Eq',1,0,'^Eq'],
['^skill\\.custom[0-9]+\\.ranks','([0-9]+)','skill.custom*.ranks','Et',1,0,'^Et'],
['^skill\\.disguise\\.misc','','skill.disguise.misc','Cd',0,0,'^Cd'],
['^skill\\.disguise\\.temp','','skill.disguise.temp','Cf',0,0,'^Cf'],
['^skill\\.heal\\.is-class','','skill.heal.is-class','Cs',0,1,'^Cs'],
['^skill\\.ride\\.is-class','','skill.ride.is-class','CI',0,1,'^CI'],
['^skill\\.stealth\\.ranks','','skill.stealth.ranks','Da',0,0,'^Da'],
['^skill\\.survival\\.misc','','skill.survival.misc','Dd',0,0,'^Dd'],
['^skill\\.survival\\.temp','','skill.survival.temp','Df',0,0,'^Df'],
['^skill\\.swim\\.is-class','','skill.swim.is-class','Dg',0,1,'^Dg'],
['^load\\.heavy\\.max-dex','','load.heavy.max-dex','AV',0,0,'^AV'],
['^skill\\.craft[0-9]+\\.categ','([0-9]+)','skill.craft*.categ','Ek',1,0,'^Ek'],
['^skill\\.craft[0-9]+\\.ranks','([0-9]+)','skill.craft*.ranks','En',1,0,'^En'],
['^skill\\.custom[0-9]+\\.misc','([0-9]+)','skill.custom*.misc','Es',1,0,'^Es'],
['^skill\\.custom[0-9]+\\.temp','([0-9]+)','skill.custom*.temp','Eu',1,0,'^Eu'],
['^skill\\.fly\\.is-class','','skill.fly.is-class','Ck',0,1,'^Ck'],
['^skill\\.kn[0-9]+\\.is-class','([0-9]+)','skill.kn*.is-class','Ew',1,1,'^Ew'],
['^skill\\.stealth\\.misc','','skill.stealth.misc','CZ',0,0,'^CZ'],
['^skill\\.stealth\\.temp','','skill.stealth.temp','Db',0,0,'^Db'],
['^md\\.prevChangeTime','','md.prevChangeTime','Bd',0,0,'^Bd'],
['^shield\\.spell-fail','','shield.spell-fail','BC',0,0,'^BC'],
['^skill\\.bluff\\.ranks','','skill.bluff.ranks','BO',0,0,'^BO'],
['^skill\\.climb\\.ranks','','skill.climb.ranks','BS',0,0,'^BS'],
['^skill\\.craft[0-9]+\\.misc','([0-9]+)','skill.craft*.misc','Em',1,0,'^Em'],
['^skill\\.craft[0-9]+\\.temp','([0-9]+)','skill.craft*.temp','Eo',1,0,'^Eo'],
['^skill\\.perf[0-9]+\\.categ','([0-9]+)','skill.perf*.categ','EA',1,0,'^EA'],
['^skill\\.perf[0-9]+\\.ranks','([0-9]+)','skill.perf*.ranks','ED',1,0,'^ED'],
['^skill\\.prof[0-9]+\\.categ','([0-9]+)','skill.prof*.categ','EF',1,0,'^EF'],
['^skill\\.prof[0-9]+\\.ranks','([0-9]+)','skill.prof*.ranks','EI',1,0,'^EI'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l0.*.duration','EN',-2,0,'^EN'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l1.*.duration','Fb',-2,0,'^Fb'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l2.*.duration','Fp',-2,0,'^Fp'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l3.*.duration','FD',-2,0,'^FD'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l4.*.duration','FR',-2,0,'^FR'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l5.*.duration','Gf',-2,0,'^Gf'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l6.*.duration','Gt',-2,0,'^Gt'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l7.*.duration','GH',-2,0,'^GH'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l8.*.duration','GV',-2,0,'^GV'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.duration','([0-9]+).+\\.([0-9]+)','sp*.l9.*.duration','Hj',-2,0,'^Hj'],
['^armor\\.spell-fail','','armor.spell-fail','An',0,0,'^An'],
['^rage\\.rounds\\.misc','','rage.rounds.misc','Br',0,0,'^Br'],
['^rage\\.rounds\\.used','','rage.rounds.used','Bs',0,0,'^Bs'],
['^skill\\.bluff\\.misc','','skill.bluff.misc','BN',0,0,'^BN'],
['^skill\\.bluff\\.temp','','skill.bluff.temp','BP',0,0,'^BP'],
['^skill\\.climb\\.misc','','skill.climb.misc','BR',0,0,'^BR'],
['^skill\\.climb\\.temp','','skill.climb.temp','BT',0,0,'^BT'],
['^skill\\.heal\\.ranks','','skill.heal.ranks','Cu',0,0,'^Cu'],
['^skill\\.perf[0-9]+\\.misc','([0-9]+)','skill.perf*.misc','EC',1,0,'^EC'],
['^skill\\.perf[0-9]+\\.temp','([0-9]+)','skill.perf*.temp','EE',1,0,'^EE'],
['^skill\\.prof[0-9]+\\.misc','([0-9]+)','skill.prof*.misc','EH',1,0,'^EH'],
['^skill\\.prof[0-9]+\\.temp','([0-9]+)','skill.prof*.temp','EJ',1,0,'^EJ'],
['^skill\\.ride\\.ranks','','skill.ride.ranks','CK',0,0,'^CK'],
['^skill\\.swim\\.ranks','','skill.swim.ranks','Di',0,0,'^Di'],
['^stat\\.CHA\\.enhance','','stat.CHA.enhance','Dx',0,0,'^Dx'],
['^stat\\.CON\\.enhance','','stat.CON.enhance','DB',0,0,'^DB'],
['^stat\\.DEX\\.enhance','','stat.DEX.enhance','DF',0,0,'^DF'],
['^stat\\.INT\\.enhance','','stat.INT.enhance','DJ',0,0,'^DJ'],
['^stat\\.STR\\.enhance','','stat.STR.enhance','DO',0,0,'^DO'],
['^stat\\.WIS\\.enhance','','stat.WIS.enhance','DS',0,0,'^DS'],
['^skill\\.fly\\.ranks','','skill.fly.ranks','Cm',0,0,'^Cm'],
['^skill\\.heal\\.misc','','skill.heal.misc','Ct',0,0,'^Ct'],
['^skill\\.heal\\.temp','','skill.heal.temp','Cv',0,0,'^Cv'],
['^skill\\.kn[0-9]+\\.categ','([0-9]+)','skill.kn*.categ','Ev',1,0,'^Ev'],
['^skill\\.kn[0-9]+\\.ranks','([0-9]+)','skill.kn*.ranks','Ey',1,0,'^Ey'],
['^skill\\.ride\\.misc','','skill.ride.misc','CJ',0,0,'^CJ'],
['^skill\\.ride\\.temp','','skill.ride.temp','CL',0,0,'^CL'],
['^skill\\.swim\\.misc','','skill.swim.misc','Dh',0,0,'^Dh'],
['^skill\\.swim\\.temp','','skill.swim.temp','Dj',0,0,'^Dj'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l0.*.school','ES',-2,0,'^ES'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l1.*.school','Fg',-2,0,'^Fg'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l2.*.school','Fu',-2,0,'^Fu'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l3.*.school','FI',-2,0,'^FI'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l4.*.school','FW',-2,0,'^FW'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l5.*.school','Gk',-2,0,'^Gk'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l6.*.school','Gy',-2,0,'^Gy'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l7.*.school','GM',-2,0,'^GM'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l8.*.school','Ha',-2,0,'^Ha'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.school','([0-9]+).+\\.([0-9]+)','sp*.l9.*.school','Ho',-2,0,'^Ho'],
['^info\\.alignment','','info.alignment','AB',0,0,'^AB'],
['^info\\.character','','info.character','AC',0,0,'^AC'],
['^info\\.languages','','info.languages','AK',0,0,'^AK'],
['^note\\.character','','note.character','Bj',0,0,'^Bj'],
['^note\\.equipment','','note.equipment','Bk',0,0,'^Bk'],
['^shield\\.max-dex','','shield.max-dex','BA',0,0,'^BA'],
['^skill\\.fly\\.misc','','skill.fly.misc','Cl',0,0,'^Cl'],
['^skill\\.fly\\.temp','','skill.fly.temp','Cn',0,0,'^Cn'],
['^skill\\.kn[0-9]+\\.misc','([0-9]+)','skill.kn*.misc','Ex',1,0,'^Ex'],
['^skill\\.kn[0-9]+\\.temp','([0-9]+)','skill.kn*.temp','Ez',1,0,'^Ez'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l0.*.range','EQ',-2,4,'^EQ'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l1.*.range','Fe',-2,4,'^Fe'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l2.*.range','Fs',-2,4,'^Fs'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l3.*.range','FG',-2,4,'^FG'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l4.*.range','FU',-2,4,'^FU'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l5.*.range','Gi',-2,4,'^Gi'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l6.*.range','Gw',-2,4,'^Gw'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l7.*.range','GK',-2,4,'^GK'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l8.*.range','GY',-2,4,'^GY'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.range','([0-9]+).+\\.([0-9]+)','sp*.l9.*.range','Hm',-2,4,'^Hm'],
['^speed\\.fly-manu','','speed.fly-manu','Ds',0,0,'^Ds'],
['^weapon[0-9]+\\.weight','([0-9]+)','weapon*.weight','HE',1,0,'^HE'],
['^ac\\.touch-misc','','ac.touch-misc','Ag',0,0,'^Ag'],
['^armor\\.max-dex','','armor.max-dex','Ak',0,0,'^Ak'],
['^class[0-9]+\\.levels','([0-9]+)','class*.levels','Ed',1,0,'^Ed'],
['^shield\\.weight','','shield.weight','BD',0,0,'^BD'],
['^sp[0-9]+\\.className','([0-9]+)\\.','sp*.className','EL',1,0,'^EL'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l0.*.name','EO',-2,0,'^EO'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l0.*.prep','EP',-2,0,'^EP'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l0.*.save','ER',-2,0,'^ER'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l0.*.used','EU',-2,0,'^EU'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l1.*.name','Fc',-2,0,'^Fc'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l1.*.prep','Fd',-2,0,'^Fd'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l1.*.save','Ff',-2,0,'^Ff'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l1.*.used','Fi',-2,0,'^Fi'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l2.*.name','Fq',-2,0,'^Fq'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l2.*.prep','Fr',-2,0,'^Fr'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l2.*.save','Ft',-2,0,'^Ft'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l2.*.used','Fw',-2,0,'^Fw'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l3.*.name','FE',-2,0,'^FE'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l3.*.prep','FF',-2,0,'^FF'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l3.*.save','FH',-2,0,'^FH'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l3.*.used','FK',-2,0,'^FK'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l4.*.name','FS',-2,0,'^FS'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l4.*.prep','FT',-2,0,'^FT'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l4.*.save','FV',-2,0,'^FV'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l4.*.used','FY',-2,0,'^FY'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l5.*.name','Gg',-2,0,'^Gg'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l5.*.prep','Gh',-2,0,'^Gh'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l5.*.save','Gj',-2,0,'^Gj'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l5.*.used','Gm',-2,0,'^Gm'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l6.*.name','Gu',-2,0,'^Gu'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l6.*.prep','Gv',-2,0,'^Gv'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l6.*.save','Gx',-2,0,'^Gx'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l6.*.used','GA',-2,0,'^GA'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l7.*.name','GI',-2,0,'^GI'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l7.*.prep','GJ',-2,0,'^GJ'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l7.*.save','GL',-2,0,'^GL'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l7.*.used','GO',-2,0,'^GO'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l8.*.name','GW',-2,0,'^GW'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l8.*.prep','GX',-2,0,'^GX'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l8.*.save','GZ',-2,0,'^GZ'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l8.*.used','Hc',-2,0,'^Hc'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.name','([0-9]+).+\\.([0-9]+)','sp*.l9.*.name','Hk',-2,0,'^Hk'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.prep','([0-9]+).+\\.([0-9]+)','sp*.l9.*.prep','Hl',-2,0,'^Hl'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.save','([0-9]+).+\\.([0-9]+)','sp*.l9.*.save','Hn',-2,0,'^Hn'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.used','([0-9]+).+\\.([0-9]+)','sp*.l9.*.used','Hq',-2,0,'^Hq'],
['^speed\\.armored','','speed.armored','Do',0,0,'^Do'],
['^stat\\.CHA\\.base','','stat.CHA.base','Dw',0,0,'^Dw'],
['^stat\\.CHA\\.misc','','stat.CHA.misc','Dy',0,0,'^Dy'],
['^stat\\.CHA\\.temp','','stat.CHA.temp','Dz',0,0,'^Dz'],
['^stat\\.CON\\.base','','stat.CON.base','DA',0,0,'^DA'],
['^stat\\.CON\\.misc','','stat.CON.misc','DC',0,0,'^DC'],
['^stat\\.CON\\.temp','','stat.CON.temp','DD',0,0,'^DD'],
['^stat\\.DEX\\.base','','stat.DEX.base','DE',0,0,'^DE'],
['^stat\\.DEX\\.misc','','stat.DEX.misc','DG',0,0,'^DG'],
['^stat\\.DEX\\.temp','','stat.DEX.temp','DH',0,0,'^DH'],
['^stat\\.INT\\.base','','stat.INT.base','DI',0,0,'^DI'],
['^stat\\.INT\\.misc','','stat.INT.misc','DK',0,0,'^DK'],
['^stat\\.INT\\.temp','','stat.INT.temp','DL',0,0,'^DL'],
['^stat\\.STR\\.base','','stat.STR.base','DN',0,0,'^DN'],
['^stat\\.STR\\.misc','','stat.STR.misc','DP',0,0,'^DP'],
['^stat\\.STR\\.temp','','stat.STR.temp','DQ',0,0,'^DQ'],
['^stat\\.WIS\\.base','','stat.WIS.base','DR',0,0,'^DR'],
['^stat\\.WIS\\.misc','','stat.WIS.misc','DT',0,0,'^DT'],
['^stat\\.WIS\\.temp','','stat.WIS.temp','DU',0,0,'^DU'],
['^weapon[0-9]+\\.bonus','([0-9]+)','weapon*.bonus','Hx',1,0,'^Hx'],
['^weapon[0-9]+\\.range','([0-9]+)','weapon*.range','HC',1,0,'^HC'],
['^armor\\.weight','','armor.weight','Ap',0,0,'^Ap'],
['^class[0-9]+\\.class','([0-9]+)','class*.class','DZ',1,0,'^DZ'],
['^class[0-9]+\\.skill','([0-9]+)','class*.skill','Ef',1,0,'^Ef'],
['^fort\\.enhance','','fort.enhance','Au',0,0,'^Au'],
['^info\\.resists','','info.resists','AN',0,0,'^AN'],
['^note\\.ability','','note.ability','Bh',0,0,'^Bh'],
['^note\\.special','','note.special','Bo',0,0,'^Bo'],
['^refl\\.enhance','','refl.enhance','Bv',0,0,'^Bv'],
['^sp[0-9]+\\.l0\\.class','([0-9]+)\\.','sp*.l0.class','EV',1,0,'^EV'],
['^sp[0-9]+\\.l0\\.known','([0-9]+)\\.','sp*.l0.known','EX',1,0,'^EX'],
['^sp[0-9]+\\.l1\\.class','([0-9]+)\\.','sp*.l1.class','Fj',1,0,'^Fj'],
['^sp[0-9]+\\.l1\\.known','([0-9]+)\\.','sp*.l1.known','Fl',1,0,'^Fl'],
['^sp[0-9]+\\.l2\\.class','([0-9]+)\\.','sp*.l2.class','Fx',1,0,'^Fx'],
['^sp[0-9]+\\.l2\\.known','([0-9]+)\\.','sp*.l2.known','Fz',1,0,'^Fz'],
['^sp[0-9]+\\.l3\\.class','([0-9]+)\\.','sp*.l3.class','FL',1,0,'^FL'],
['^sp[0-9]+\\.l3\\.known','([0-9]+)\\.','sp*.l3.known','FN',1,0,'^FN'],
['^sp[0-9]+\\.l4\\.class','p([0-9]+)\\.','sp*.l4.class','FZ',1,0,'^FZ'],
['^sp[0-9]+\\.l4\\.known','p([0-9]+)\\.','sp*.l4.known','Gb',1,0,'^Gb'],
['^sp[0-9]+\\.l5\\.class','p([0-9]+)\\.','sp*.l5.class','Gn',1,0,'^Gn'],
['^sp[0-9]+\\.l5\\.known','p([0-9]+)\\.','sp*.l5.known','Gp',1,0,'^Gp'],
['^sp[0-9]+\\.l6\\.class','([0-9]+)\\.','sp*.l6.class','GB',1,0,'^GB'],
['^sp[0-9]+\\.l6\\.known','([0-9]+)\\.','sp*.l6.known','GD',1,0,'^GD'],
['^sp[0-9]+\\.l7\\.class','([0-9]+)\\.','sp*.l7.class','GP',1,0,'^GP'],
['^sp[0-9]+\\.l7\\.known','([0-9]+)\\.','sp*.l7.known','GR',1,0,'^GR'],
['^sp[0-9]+\\.l8\\.class','([0-9]+)\\.','sp*.l8.class','Hd',1,0,'^Hd'],
['^sp[0-9]+\\.l8\\.known','([0-9]+)\\.','sp*.l8.known','Hf',1,0,'^Hf'],
['^sp[0-9]+\\.l9\\.class','([0-9]+)\\.','sp*.l9.class','Hr',1,0,'^Hr'],
['^sp[0-9]+\\.l9\\.known','([0-9]+)\\.','sp*.l9.known','Ht',1,0,'^Ht'],
['^speed\\.burrow','','speed.burrow','Dp',0,0,'^Dp'],
['^weapon[0-9]+\\.crit','([0-9]+)','weapon*.crit','Hy',1,0,'^Hy'],
['^weapon[0-9]+\\.desc','([0-9]+)','weapon*.desc','Hz',1,0,'^Hz'],
['^weapon[0-9]+\\.note','([0-9]+)','weapon*.note','HB',1,0,'^HB'],
['^weapon[0-9]+\\.type','([0-9]+)','weapon*.type','HD',1,0,'^HD'],
['^will\\.enhance','','will.enhance','DV',0,0,'^DV'],
['^class[0-9]+\\.fort','([0-9]+)','class*.fort','Ea',1,0,'^Ea'],
['^class[0-9]+\\.refl','([0-9]+)','class*.refl','Ee',1,0,'^Ee'],
['^class[0-9]+\\.will','([0-9]+)','class*.will','Eg',1,0,'^Eg'],
['^eq\\.[0-9]+\\.weight','([0-9]+)','eq.*.weight','Ej',1,0,'^Ej'],
['^info\\.gender','','info.gender','AG',0,0,'^AG'],
['^info\\.height','','info.height','AI',0,0,'^AI'],
['^info\\.player','','info.player','AL',0,0,'^AL'],
['^info\\.weight','','info.weight','AQ',0,0,'^AQ'],
['^note\\.attack','','note.attack','Bi',0,0,'^Bi'],
['^rage\\.enable','','rage.enable','Bp',0,1,'^Bp'],
['^ranged\\.misc','','ranged.misc','Bt',0,0,'^Bt'],
['^ranged\\.temp','','ranged.temp','Bu',0,0,'^Bu'],
['^shield\\.desc','','shield.desc','Bz',0,0,'^Bz'],
['^sp[0-9]+\\.ability','([0-9]+)\\.','sp*.ability','EK',1,2,'^EK'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l0.*.dc','EM',-2,0,'^EM'],
['^sp[0-9]+\\.l0\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l0.*.SR','ET',-2,1,'^ET'],
['^sp[0-9]+\\.l0\\.misc','([0-9]+)\\.','sp*.l0.misc','EY',1,0,'^EY'],
['^sp[0-9]+\\.l0\\.used','([0-9]+)\\.','sp*.l0.used','EZ',1,0,'^EZ'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l1.*.dc','Fa',-2,0,'^Fa'],
['^sp[0-9]+\\.l1\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l1.*.SR','Fh',-2,1,'^Fh'],
['^sp[0-9]+\\.l1\\.misc','([0-9]+)\\.','sp*.l1.misc','Fm',1,0,'^Fm'],
['^sp[0-9]+\\.l1\\.used','([0-9]+)\\.','sp*.l1.used','Fn',1,0,'^Fn'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l2.*.dc','Fo',-2,0,'^Fo'],
['^sp[0-9]+\\.l2\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l2.*.SR','Fv',-2,1,'^Fv'],
['^sp[0-9]+\\.l2\\.misc','([0-9]+)\\.','sp*.l2.misc','FA',1,0,'^FA'],
['^sp[0-9]+\\.l2\\.used','([0-9]+)\\.','sp*.l2.used','FB',1,0,'^FB'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l3.*.dc','FC',-2,0,'^FC'],
['^sp[0-9]+\\.l3\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l3.*.SR','FJ',-2,1,'^FJ'],
['^sp[0-9]+\\.l3\\.misc','([0-9]+)\\.','sp*.l3.misc','FO',1,0,'^FO'],
['^sp[0-9]+\\.l3\\.used','([0-9]+)\\.','sp*.l3.used','FP',1,0,'^FP'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l4.*.dc','FQ',-2,0,'^FQ'],
['^sp[0-9]+\\.l4\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l4.*.SR','FX',-2,1,'^FX'],
['^sp[0-9]+\\.l4\\.misc','p([0-9]+)\\.','sp*.l4.misc','Gc',1,0,'^Gc'],
['^sp[0-9]+\\.l4\\.used','p([0-9]+)\\.','sp*.l4.used','Gd',1,0,'^Gd'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l5.*.dc','Ge',-2,0,'^Ge'],
['^sp[0-9]+\\.l5\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l5.*.SR','Gl',-2,1,'^Gl'],
['^sp[0-9]+\\.l5\\.misc','p([0-9]+)\\.','sp*.l5.misc','Gq',1,0,'^Gq'],
['^sp[0-9]+\\.l5\\.used','p([0-9]+)\\.','sp*.l5.used','Gr',1,0,'^Gr'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l6.*.dc','Gs',-2,0,'^Gs'],
['^sp[0-9]+\\.l6\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l6.*.SR','Gz',-2,1,'^Gz'],
['^sp[0-9]+\\.l6\\.misc','([0-9]+)\\.','sp*.l6.misc','GE',1,0,'^GE'],
['^sp[0-9]+\\.l6\\.used','([0-9]+)\\.','sp*.l6.used','GF',1,0,'^GF'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l7.*.dc','GG',-2,0,'^GG'],
['^sp[0-9]+\\.l7\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l7.*.SR','GN',-2,1,'^GN'],
['^sp[0-9]+\\.l7\\.misc','([0-9]+)\\.','sp*.l7.misc','GS',1,0,'^GS'],
['^sp[0-9]+\\.l7\\.used','([0-9]+)\\.','sp*.l7.used','GT',1,0,'^GT'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.dc','([0-9]+)\\.','sp*.l8.*.dc','GU',1,0,'^GU'],
['^sp[0-9]+\\.l8\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l8.*.SR','Hb',-2,1,'^Hb'],
['^sp[0-9]+\\.l8\\.misc','([0-9]+)\\.','sp*.l8.misc','Hg',1,0,'^Hg'],
['^sp[0-9]+\\.l8\\.used','([0-9]+)\\.','sp*.l8.used','Hh',1,0,'^Hh'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.dc','([0-9]+).+\\.([0-9]+)','sp*.l9.*.dc','Hi',-2,0,'^Hi'],
['^sp[0-9]+\\.l9\\.[0-9]+\\.SR','([0-9]+).+\\.([0-9]+)','sp*.l9.*.SR','Hp',-2,1,'^Hp'],
['^sp[0-9]+\\.l9\\.misc','([0-9]+)\\.','sp*.l9.misc','Hu',1,0,'^Hu'],
['^sp[0-9]+\\.l9\\.used','([0-9]+)\\.','sp*.l9.used','Hv',1,0,'^Hv'],
['^speed\\.climb','','speed.climb','Dq',0,0,'^Dq'],
['^weapon[0-9]+\\.dmg','([0-9]+)','weapon*.dmg','HA',1,0,'^HA'],
['^ac\\.ac-misc','','ac.ac-misc','Aa',0,0,'^Aa'],
['^ac\\.deflect','','ac.deflect','Ab',0,0,'^Ab'],
['^ac\\.ff-misc','','ac.ff-misc','Ad',0,0,'^Ad'],
['^ac\\.natural','','ac.natural','Ae',0,0,'^Ae'],
['^armor\\.desc','','armor.desc','Ai',0,0,'^Ai'],
['^armor\\.type','','armor.type','Ao',0,3,'^Ao'],
['^class[0-9]+\\.bab','([0-9]+)','class*.bab','DY',1,0,'^DY'],
['^eq\\.[0-9]+\\.value','([0-9]+)','eq.*.value','Ei',1,0,'^Ei'],
['^hp\\.subdual','','hp.subdual','Ay',0,0,'^Ay'],
['^info\\.deity','','info.deity','AD',0,0,'^AD'],
['^melee\\.misc','','melee.misc','Bf',0,0,'^Bf'],
['^melee\\.temp','','melee.temp','Bg',0,0,'^Bg'],
['^rage\\.level','','rage.level','Bq',0,0,'^Bq'],
['^speed\\.misc','','speed.misc','Dt',0,0,'^Dt'],
['^speed\\.swim','','speed.swim','Du',0,0,'^Du'],
['^speed\\.temp','','speed.temp','Dv',0,0,'^Dv'],
['^class[0-9]+\\.hd','([0-9]+)','class*.hd','Eb',1,0,'^Eb'],
['^class[0-9]+\\.hp','([0-9]+)','class*.hp','Ec',1,0,'^Ec'],
['^eq\\.[0-9]+\\.name','([0-9]+)','eq.*.name','Eh',1,0,'^Eh'],
['^fort\\.misc','','fort.misc','Av',0,0,'^Av'],
['^fort\\.temp','','fort.temp','Aw',0,0,'^Aw'],
['^hp\\.lethal','','hp.lethal','Ax',0,0,'^Ax'],
['^info\\.eyes','','info.eyes','AF',0,0,'^AF'],
['^info\\.hair','','info.hair','AH',0,0,'^AH'],
['^info\\.race','','info.race','AM',0,0,'^AM'],
['^info\\.skin','','info.skin','AO',0,0,'^AO'],
['^init\\.misc','','init.misc','AS',0,0,'^AS'],
['^init\\.temp','','init.temp','AT',0,0,'^AT'],
['^load\\.note','','load.note','Bb',0,0,'^Bb'],
['^note\\.feat','','note.feat','Bl',0,0,'^Bl'],
['^note\\.rage','','note.rage','Bm',0,0,'^Bm'],
['^note\\.save','','note.save','Bn',0,0,'^Bn'],
['^refl\\.misc','','refl.misc','Bw',0,0,'^Bw'],
['^refl\\.temp','','refl.temp','Bx',0,0,'^Bx'],
['^shield\\.ac','','shield.ac','By',0,0,'^By'],
['^sp[0-9]+\\.l0\\.dc','([0-9]+)\\.','sp*.l0.dc','EW',1,0,'^EW'],
['^sp[0-9]+\\.l1\\.dc','([0-9]+)\\.','sp*.l1.dc','Fk',1,0,'^Fk'],
['^sp[0-9]+\\.l2\\.dc','([0-9]+)\\.','sp*.l2.dc','Fy',1,0,'^Fy'],
['^sp[0-9]+\\.l3\\.dc','([0-9]+)\\.','sp*.l3.dc','FM',1,0,'^FM'],
['^sp[0-9]+\\.l4\\.dc','p([0-9]+)\\.','sp*.l4.dc','Ga',1,0,'^Ga'],
['^sp[0-9]+\\.l5\\.dc','p([0-9]+)\\.','sp*.l5.dc','Go',1,0,'^Go'],
['^sp[0-9]+\\.l6\\.dc','([0-9]+)\\.','sp*.l6.dc','GC',1,0,'^GC'],
['^sp[0-9]+\\.l7\\.dc','([0-9]+)\\.','sp*.l7.dc','GQ',1,0,'^GQ'],
['^sp[0-9]+\\.l8\\.dc','([0-9]+)\\.','sp*.l8.dc','He',1,0,'^He'],
['^sp[0-9]+\\.l9\\.dc','([0-9]+)\\.','sp*.l9.dc','Hs',1,0,'^Hs'],
['^sp[0-9]+\\.level','([0-9]+)\\.','sp*.level','Hw',1,0,'^Hw'],
['^speed\\.fly','','speed.fly','Dr',0,0,'^Dr'],
['^stat\\.size','','stat.size','DM',0,0,'^DM'],
['^will\\.misc','','will.misc','DW',0,0,'^DW'],
['^will\\.temp','','will.temp','DX',0,0,'^DX'],
['^ac\\.dodge','','ac.dodge','Ac',0,0,'^Ac'],
['^armor\\.ac','','armor.ac','Ah',0,0,'^Ah'],
['^cmb\\.misc','','cmb.misc','Aq',0,0,'^Aq'],
['^cmb\\.temp','','cmb.temp','Ar',0,0,'^Ar'],
['^cmd\\.misc','','cmd.misc','As',0,0,'^As'],
['^cmd\\.temp','','cmd.temp','At',0,0,'^At'],
['^info\\.age','','info.age','AA',0,0,'^AA'],
['^init\\.enh','','init.enh','AR',0,0,'^AR'],
['^sp[0-9]+\\.note','([0-9]+)\\.','sp*.note','HF',1,0,'^HF'],
['^ac\\.temp','','ac.temp','Af',0,0,'^Af'],
['^hp\\.temp','','hp.temp','Az',0,0,'^Az'],
['^info\\.dr','','info.dr','AE',0,0,'^AE'],
['^info\\.sr','','info.sr','AP',0,0,'^AP'],
['^md\\.rev','','md.rev','Be',0,0,'^Be'],

				// The empty ones for future
				/*
['^','','','HG',0,0,'^HG'],
['^','','','HH',0,0,'^HH'],
['^','','','HI',0,0,'^HI'],
['^','','','HJ',0,0,'^HJ'],
['^','','','HK',0,0,'^HK'],
['^','','','HL',0,0,'^HL'],
['^','','','HM',0,0,'^HM'],
['^','','','HN',0,0,'^HN'],
['^','','','HO',0,0,'^HO'],
['^','','','HP',0,0,'^HP'],
['^','','','HQ',0,0,'^HQ'],
['^','','','HR',0,0,'^HR'],
['^','','','HS',0,0,'^HS'],
['^','','','HT',0,0,'^HT'],
['^','','','HU',0,0,'^HU'],
['^','','','HV',0,0,'^HV'],
['^','','','HW',0,0,'^HW'],
['^','','','HX',0,0,'^HX'],
['^','','','HY',0,0,'^HY'],
['^','','','HZ',0,0,'^HZ'],
['^','','','Ia',0,0,'^Ia'],
['^','','','Ib',0,0,'^Ib'],
['^','','','Ic',0,0,'^Ic'],
['^','','','Id',0,0,'^Id'],
['^','','','Ie',0,0,'^Ie'],
['^','','','If',0,0,'^If'],
['^','','','Ig',0,0,'^Ig'],
['^','','','Ih',0,0,'^Ih'],
['^','','','Ii',0,0,'^Ii'],
['^','','','Ij',0,0,'^Ij'],
['^','','','Ik',0,0,'^Ik'],
['^','','','Il',0,0,'^Il'],
['^','','','Im',0,0,'^Im'],
['^','','','In',0,0,'^In'],
['^','','','Io',0,0,'^Io'],
['^','','','Ip',0,0,'^Ip'],
['^','','','Iq',0,0,'^Iq'],
['^','','','Ir',0,0,'^Ir'],
['^','','','Is',0,0,'^Is'],
['^','','','It',0,0,'^It'],
['^','','','Iu',0,0,'^Iu'],
['^','','','Iv',0,0,'^Iv'],
['^','','','Iw',0,0,'^Iw'],
['^','','','Ix',0,0,'^Ix'],
['^','','','Iy',0,0,'^Iy'],
['^','','','Iz',0,0,'^Iz'],
['^','','','IA',0,0,'^IA'],
['^','','','IB',0,0,'^IB'],
['^','','','IC',0,0,'^IC'],
['^','','','ID',0,0,'^ID'],
['^','','','IE',0,0,'^IE'],
['^','','','IF',0,0,'^IF'],
['^','','','IG',0,0,'^IG'],
['^','','','IH',0,0,'^IH'],
['^','','','II',0,0,'^II'],
['^','','','IJ',0,0,'^IJ'],
['^','','','IK',0,0,'^IK'],
['^','','','IL',0,0,'^IL'],
['^','','','IM',0,0,'^IM'],
['^','','','IN',0,0,'^IN'],
['^','','','IO',0,0,'^IO'],
['^','','','IP',0,0,'^IP'],
['^','','','IQ',0,0,'^IQ'],
['^','','','IR',0,0,'^IR'],
['^','','','IS',0,0,'^IS'],
['^','','','IT',0,0,'^IT'],
['^','','','IU',0,0,'^IU'],
['^','','','IV',0,0,'^IV'],
['^','','','IW',0,0,'^IW'],
['^','','','IX',0,0,'^IX'],
['^','','','IY',0,0,'^IY'],
['^','','','IZ',0,0,'^IZ'],
['^','','','Ja',0,0,'^Ja'],
['^','','','Jb',0,0,'^Jb'],
['^','','','Jc',0,0,'^Jc'],
['^','','','Jd',0,0,'^Jd'],
['^','','','Je',0,0,'^Je'],
['^','','','Jf',0,0,'^Jf'],
['^','','','Jg',0,0,'^Jg'],
['^','','','Jh',0,0,'^Jh'],
['^','','','Ji',0,0,'^Ji'],
['^','','','Jj',0,0,'^Jj'],
['^','','','Jk',0,0,'^Jk'],
['^','','','Jl',0,0,'^Jl'],
['^','','','Jm',0,0,'^Jm'],
['^','','','Jn',0,0,'^Jn'],
['^','','','Jo',0,0,'^Jo'],
['^','','','Jp',0,0,'^Jp'],
['^','','','Jq',0,0,'^Jq'],
['^','','','Jr',0,0,'^Jr'],
['^','','','Js',0,0,'^Js'],
['^','','','Jt',0,0,'^Jt'],
['^','','','Ju',0,0,'^Ju'],
['^','','','Jv',0,0,'^Jv'],
['^','','','Jw',0,0,'^Jw'],
['^','','','Jx',0,0,'^Jx'],
['^','','','Jy',0,0,'^Jy'],
['^','','','Jz',0,0,'^Jz'],
['^','','','JA',0,0,'^JA'],
['^','','','JB',0,0,'^JB'],
['^','','','JC',0,0,'^JC'],
['^','','','JD',0,0,'^JD'],
['^','','','JE',0,0,'^JE'],
['^','','','JF',0,0,'^JF'],
['^','','','JG',0,0,'^JG'],
['^','','','JH',0,0,'^JH'],
['^','','','JI',0,0,'^JI'],
['^','','','JJ',0,0,'^JJ'],
['^','','','JK',0,0,'^JK'],
['^','','','JL',0,0,'^JL'],
['^','','','JM',0,0,'^JM'],
['^','','','JN',0,0,'^JN'],
['^','','','JO',0,0,'^JO'],
['^','','','JP',0,0,'^JP'],
['^','','','JQ',0,0,'^JQ'],
['^','','','JR',0,0,'^JR'],
['^','','','JS',0,0,'^JS'],
['^','','','JT',0,0,'^JT'],
['^','','','JU',0,0,'^JU'],
['^','','','JV',0,0,'^JV'],
['^','','','JW',0,0,'^JW'],
['^','','','JX',0,0,'^JX'],
['^','','','JY',0,0,'^JY'],
['^','','','JZ',0,0,'^JZ'],
['^','','','Ka',0,0,'^Ka'],
['^','','','Kb',0,0,'^Kb'],
['^','','','Kc',0,0,'^Kc'],
['^','','','Kd',0,0,'^Kd'],
['^','','','Ke',0,0,'^Ke'],
['^','','','Kf',0,0,'^Kf'],
['^','','','Kg',0,0,'^Kg'],
['^','','','Kh',0,0,'^Kh'],
['^','','','Ki',0,0,'^Ki'],
['^','','','Kj',0,0,'^Kj'],
['^','','','Kk',0,0,'^Kk'],
['^','','','Kl',0,0,'^Kl'],
['^','','','Km',0,0,'^Km'],
['^','','','Kn',0,0,'^Kn'],
['^','','','Ko',0,0,'^Ko'],
['^','','','Kp',0,0,'^Kp'],
['^','','','Kq',0,0,'^Kq'],
['^','','','Kr',0,0,'^Kr'],
['^','','','Ks',0,0,'^Ks'],
['^','','','Kt',0,0,'^Kt'],
['^','','','Ku',0,0,'^Ku'],
['^','','','Kv',0,0,'^Kv'],
['^','','','Kw',0,0,'^Kw'],
['^','','','Kx',0,0,'^Kx'],
['^','','','Ky',0,0,'^Ky'],
['^','','','Kz',0,0,'^Kz'],
['^','','','KA',0,0,'^KA'],
['^','','','KB',0,0,'^KB'],
['^','','','KC',0,0,'^KC'],
['^','','','KD',0,0,'^KD'],
['^','','','KE',0,0,'^KE'],
['^','','','KF',0,0,'^KF'],
['^','','','KG',0,0,'^KG'],
['^','','','KH',0,0,'^KH'],
['^','','','KI',0,0,'^KI'],
['^','','','KJ',0,0,'^KJ'],
['^','','','KK',0,0,'^KK'],
['^','','','KL',0,0,'^KL'],
['^','','','KM',0,0,'^KM'],
['^','','','KN',0,0,'^KN'],
['^','','','KO',0,0,'^KO'],
['^','','','KP',0,0,'^KP'],
['^','','','KQ',0,0,'^KQ'],
['^','','','KR',0,0,'^KR'],
['^','','','KS',0,0,'^KS'],
['^','','','KT',0,0,'^KT'],
['^','','','KU',0,0,'^KU'],
['^','','','KV',0,0,'^KV'],
['^','','','KW',0,0,'^KW'],
['^','','','KX',0,0,'^KX'],
['^','','','KY',0,0,'^KY'],
['^','','','KZ',0,0,'^KZ'],
['^','','','La',0,0,'^La'],
['^','','','Lb',0,0,'^Lb'],
['^','','','Lc',0,0,'^Lc'],
['^','','','Ld',0,0,'^Ld'],
['^','','','Le',0,0,'^Le'],
['^','','','Lf',0,0,'^Lf'],
['^','','','Lg',0,0,'^Lg'],
['^','','','Lh',0,0,'^Lh'],
['^','','','Li',0,0,'^Li'],
['^','','','Lj',0,0,'^Lj'],
['^','','','Lk',0,0,'^Lk'],
['^','','','Ll',0,0,'^Ll'],
['^','','','Lm',0,0,'^Lm'],
['^','','','Ln',0,0,'^Ln'],
['^','','','Lo',0,0,'^Lo'],
['^','','','Lp',0,0,'^Lp'],
['^','','','Lq',0,0,'^Lq'],
['^','','','Lr',0,0,'^Lr'],
['^','','','Ls',0,0,'^Ls'],
['^','','','Lt',0,0,'^Lt'],
['^','','','Lu',0,0,'^Lu'],
['^','','','Lv',0,0,'^Lv'],
['^','','','Lw',0,0,'^Lw'],
['^','','','Lx',0,0,'^Lx'],
['^','','','Ly',0,0,'^Ly'],
['^','','','Lz',0,0,'^Lz'],
['^','','','LA',0,0,'^LA'],
['^','','','LB',0,0,'^LB'],
['^','','','LC',0,0,'^LC'],
['^','','','LD',0,0,'^LD'],
['^','','','LE',0,0,'^LE'],
['^','','','LF',0,0,'^LF'],
['^','','','LG',0,0,'^LG'],
['^','','','LH',0,0,'^LH'],
['^','','','LI',0,0,'^LI'],
['^','','','LJ',0,0,'^LJ'],
['^','','','LK',0,0,'^LK'],
['^','','','LL',0,0,'^LL'],
['^','','','LM',0,0,'^LM'],
['^','','','LN',0,0,'^LN'],
['^','','','LO',0,0,'^LO'],
['^','','','LP',0,0,'^LP'],
['^','','','LQ',0,0,'^LQ'],
['^','','','LR',0,0,'^LR'],
['^','','','LS',0,0,'^LS'],
['^','','','LT',0,0,'^LT'],
['^','','','LU',0,0,'^LU'],
['^','','','LV',0,0,'^LV'],
['^','','','LW',0,0,'^LW'],
['^','','','LX',0,0,'^LX'],
['^','','','LY',0,0,'^LY'],
['^','','','LZ',0,0,'^LZ'],
['^','','','Ma',0,0,'^Ma'],
['^','','','Mb',0,0,'^Mb'],
['^','','','Mc',0,0,'^Mc'],
['^','','','Md',0,0,'^Md'],
['^','','','Me',0,0,'^Me'],
['^','','','Mf',0,0,'^Mf'],
['^','','','Mg',0,0,'^Mg'],
['^','','','Mh',0,0,'^Mh'],
['^','','','Mi',0,0,'^Mi'],
['^','','','Mj',0,0,'^Mj'],
['^','','','Mk',0,0,'^Mk'],
['^','','','Ml',0,0,'^Ml'],
['^','','','Mm',0,0,'^Mm'],
['^','','','Mn',0,0,'^Mn'],
['^','','','Mo',0,0,'^Mo'],
['^','','','Mp',0,0,'^Mp'],
['^','','','Mq',0,0,'^Mq'],
['^','','','Mr',0,0,'^Mr'],
['^','','','Ms',0,0,'^Ms'],
['^','','','Mt',0,0,'^Mt'],
['^','','','Mu',0,0,'^Mu'],
['^','','','Mv',0,0,'^Mv'],
['^','','','Mw',0,0,'^Mw'],
['^','','','Mx',0,0,'^Mx'],
['^','','','My',0,0,'^My'],
['^','','','Mz',0,0,'^Mz'],
['^','','','MA',0,0,'^MA'],
['^','','','MB',0,0,'^MB'],
['^','','','MC',0,0,'^MC'],
['^','','','MD',0,0,'^MD'],
['^','','','ME',0,0,'^ME'],
['^','','','MF',0,0,'^MF'],
['^','','','MG',0,0,'^MG'],
['^','','','MH',0,0,'^MH'],
['^','','','MI',0,0,'^MI'],
['^','','','MJ',0,0,'^MJ'],
['^','','','MK',0,0,'^MK'],
['^','','','ML',0,0,'^ML'],
['^','','','MM',0,0,'^MM'],
['^','','','MN',0,0,'^MN'],
['^','','','MO',0,0,'^MO'],
['^','','','MP',0,0,'^MP'],
['^','','','MQ',0,0,'^MQ'],
['^','','','MR',0,0,'^MR'],
['^','','','MS',0,0,'^MS'],
['^','','','MT',0,0,'^MT'],
['^','','','MU',0,0,'^MU'],
['^','','','MV',0,0,'^MV'],
['^','','','MW',0,0,'^MW'],
['^','','','MX',0,0,'^MX'],
['^','','','MY',0,0,'^MY'],
['^','','','MZ',0,0,'^MZ'],
['^','','','Na',0,0,'^Na'],
['^','','','Nb',0,0,'^Nb'],
['^','','','Nc',0,0,'^Nc'],
['^','','','Nd',0,0,'^Nd'],
['^','','','Ne',0,0,'^Ne'],
['^','','','Nf',0,0,'^Nf'],
['^','','','Ng',0,0,'^Ng'],
['^','','','Nh',0,0,'^Nh'],
['^','','','Ni',0,0,'^Ni'],
['^','','','Nj',0,0,'^Nj'],
['^','','','Nk',0,0,'^Nk'],
['^','','','Nl',0,0,'^Nl'],
['^','','','Nm',0,0,'^Nm'],
['^','','','Nn',0,0,'^Nn'],
['^','','','No',0,0,'^No'],
['^','','','Np',0,0,'^Np'],
['^','','','Nq',0,0,'^Nq'],
['^','','','Nr',0,0,'^Nr'],
['^','','','Ns',0,0,'^Ns'],
['^','','','Nt',0,0,'^Nt'],
['^','','','Nu',0,0,'^Nu'],
['^','','','Nv',0,0,'^Nv'],
['^','','','Nw',0,0,'^Nw'],
['^','','','Nx',0,0,'^Nx'],
['^','','','Ny',0,0,'^Ny'],
['^','','','Nz',0,0,'^Nz'],
['^','','','NA',0,0,'^NA'],
['^','','','NB',0,0,'^NB'],
['^','','','NC',0,0,'^NC'],
['^','','','ND',0,0,'^ND'],
['^','','','NE',0,0,'^NE'],
['^','','','NF',0,0,'^NF'],
['^','','','NG',0,0,'^NG'],
['^','','','NH',0,0,'^NH'],
['^','','','NI',0,0,'^NI'],
['^','','','NJ',0,0,'^NJ'],
['^','','','NK',0,0,'^NK'],
['^','','','NL',0,0,'^NL'],
['^','','','NM',0,0,'^NM'],
['^','','','NN',0,0,'^NN'],
['^','','','NO',0,0,'^NO'],
['^','','','NP',0,0,'^NP'],
['^','','','NQ',0,0,'^NQ'],
['^','','','NR',0,0,'^NR'],
['^','','','NS',0,0,'^NS'],
['^','','','NT',0,0,'^NT'],
['^','','','NU',0,0,'^NU'],
['^','','','NV',0,0,'^NV'],
['^','','','NW',0,0,'^NW'],
['^','','','NX',0,0,'^NX'],
['^','','','NY',0,0,'^NY'],
['^','','','NZ',0,0,'^NZ'],
['^','','','Oa',0,0,'^Oa'],
['^','','','Ob',0,0,'^Ob'],
['^','','','Oc',0,0,'^Oc'],
['^','','','Od',0,0,'^Od'],
['^','','','Oe',0,0,'^Oe'],
['^','','','Of',0,0,'^Of'],
['^','','','Og',0,0,'^Og'],
['^','','','Oh',0,0,'^Oh'],
['^','','','Oi',0,0,'^Oi'],
['^','','','Oj',0,0,'^Oj'],
['^','','','Ok',0,0,'^Ok'],
['^','','','Ol',0,0,'^Ol'],
['^','','','Om',0,0,'^Om'],
['^','','','On',0,0,'^On'],
['^','','','Oo',0,0,'^Oo'],
['^','','','Op',0,0,'^Op'],
['^','','','Oq',0,0,'^Oq'],
['^','','','Or',0,0,'^Or'],
['^','','','Os',0,0,'^Os'],
['^','','','Ot',0,0,'^Ot'],
['^','','','Ou',0,0,'^Ou'],
['^','','','Ov',0,0,'^Ov'],
['^','','','Ow',0,0,'^Ow'],
['^','','','Ox',0,0,'^Ox'],
['^','','','Oy',0,0,'^Oy'],
['^','','','Oz',0,0,'^Oz'],
['^','','','OA',0,0,'^OA'],
['^','','','OB',0,0,'^OB'],
['^','','','OC',0,0,'^OC'],
['^','','','OD',0,0,'^OD'],
['^','','','OE',0,0,'^OE'],
['^','','','OF',0,0,'^OF'],
['^','','','OG',0,0,'^OG'],
['^','','','OH',0,0,'^OH'],
['^','','','OI',0,0,'^OI'],
['^','','','OJ',0,0,'^OJ'],
['^','','','OK',0,0,'^OK'],
['^','','','OL',0,0,'^OL'],
['^','','','OM',0,0,'^OM'],
['^','','','ON',0,0,'^ON'],
['^','','','OO',0,0,'^OO'],
['^','','','OP',0,0,'^OP'],
['^','','','OQ',0,0,'^OQ'],
['^','','','OR',0,0,'^OR'],
['^','','','OS',0,0,'^OS'],
['^','','','OT',0,0,'^OT'],
['^','','','OU',0,0,'^OU'],
['^','','','OV',0,0,'^OV'],
['^','','','OW',0,0,'^OW'],
['^','','','OX',0,0,'^OX'],
['^','','','OY',0,0,'^OY'],
['^','','','OZ',0,0,'^OZ'],
['^','','','Pa',0,0,'^Pa'],
['^','','','Pb',0,0,'^Pb'],
['^','','','Pc',0,0,'^Pc'],
['^','','','Pd',0,0,'^Pd'],
['^','','','Pe',0,0,'^Pe'],
['^','','','Pf',0,0,'^Pf'],
['^','','','Pg',0,0,'^Pg'],
['^','','','Ph',0,0,'^Ph'],
['^','','','Pi',0,0,'^Pi'],
['^','','','Pj',0,0,'^Pj'],
['^','','','Pk',0,0,'^Pk'],
['^','','','Pl',0,0,'^Pl'],
['^','','','Pm',0,0,'^Pm'],
['^','','','Pn',0,0,'^Pn'],
['^','','','Po',0,0,'^Po'],
['^','','','Pp',0,0,'^Pp'],
['^','','','Pq',0,0,'^Pq'],
['^','','','Pr',0,0,'^Pr'],
['^','','','Ps',0,0,'^Ps'],
['^','','','Pt',0,0,'^Pt'],
['^','','','Pu',0,0,'^Pu'],
['^','','','Pv',0,0,'^Pv'],
['^','','','Pw',0,0,'^Pw'],
['^','','','Px',0,0,'^Px'],
['^','','','Py',0,0,'^Py'],
['^','','','Pz',0,0,'^Pz'],
['^','','','PA',0,0,'^PA'],
['^','','','PB',0,0,'^PB'],
['^','','','PC',0,0,'^PC'],
['^','','','PD',0,0,'^PD'],
['^','','','PE',0,0,'^PE'],
['^','','','PF',0,0,'^PF'],
['^','','','PG',0,0,'^PG'],
['^','','','PH',0,0,'^PH'],
['^','','','PI',0,0,'^PI'],
['^','','','PJ',0,0,'^PJ'],
['^','','','PK',0,0,'^PK'],
['^','','','PL',0,0,'^PL'],
['^','','','PM',0,0,'^PM'],
['^','','','PN',0,0,'^PN'],
['^','','','PO',0,0,'^PO'],
['^','','','PP',0,0,'^PP'],
['^','','','PQ',0,0,'^PQ'],
['^','','','PR',0,0,'^PR'],
['^','','','PS',0,0,'^PS'],
['^','','','PT',0,0,'^PT'],
['^','','','PU',0,0,'^PU'],
['^','','','PV',0,0,'^PV'],
['^','','','PW',0,0,'^PW'],
['^','','','PX',0,0,'^PX'],
['^','','','PY',0,0,'^PY'],
['^','','','PZ',0,0,'^PZ'],
['^','','','Qa',0,0,'^Qa'],
['^','','','Qb',0,0,'^Qb'],
['^','','','Qc',0,0,'^Qc'],
['^','','','Qd',0,0,'^Qd'],
['^','','','Qe',0,0,'^Qe'],
['^','','','Qf',0,0,'^Qf'],
['^','','','Qg',0,0,'^Qg'],
['^','','','Qh',0,0,'^Qh'],
['^','','','Qi',0,0,'^Qi'],
['^','','','Qj',0,0,'^Qj'],
['^','','','Qk',0,0,'^Qk'],
['^','','','Ql',0,0,'^Ql'],
['^','','','Qm',0,0,'^Qm'],
['^','','','Qn',0,0,'^Qn'],
['^','','','Qo',0,0,'^Qo'],
['^','','','Qp',0,0,'^Qp'],
['^','','','Qq',0,0,'^Qq'],
['^','','','Qr',0,0,'^Qr'],
['^','','','Qs',0,0,'^Qs'],
['^','','','Qt',0,0,'^Qt'],
['^','','','Qu',0,0,'^Qu'],
['^','','','Qv',0,0,'^Qv'],
['^','','','Qw',0,0,'^Qw'],
['^','','','Qx',0,0,'^Qx'],
['^','','','Qy',0,0,'^Qy'],
['^','','','Qz',0,0,'^Qz'],
['^','','','QA',0,0,'^QA'],
['^','','','QB',0,0,'^QB'],
['^','','','QC',0,0,'^QC'],
['^','','','QD',0,0,'^QD'],
['^','','','QE',0,0,'^QE'],
['^','','','QF',0,0,'^QF'],
['^','','','QG',0,0,'^QG'],
['^','','','QH',0,0,'^QH'],
['^','','','QI',0,0,'^QI'],
['^','','','QJ',0,0,'^QJ'],
['^','','','QK',0,0,'^QK'],
['^','','','QL',0,0,'^QL'],
['^','','','QM',0,0,'^QM'],
['^','','','QN',0,0,'^QN'],
['^','','','QO',0,0,'^QO'],
['^','','','QP',0,0,'^QP'],
['^','','','QQ',0,0,'^QQ'],
['^','','','QR',0,0,'^QR'],
['^','','','QS',0,0,'^QS'],
['^','','','QT',0,0,'^QT'],
['^','','','QU',0,0,'^QU'],
['^','','','QV',0,0,'^QV'],
['^','','','QW',0,0,'^QW'],
['^','','','QX',0,0,'^QX'],
['^','','','QY',0,0,'^QY'],
['^','','','QZ',0,0,'^QZ'],
['^','','','Ra',0,0,'^Ra'],
['^','','','Rb',0,0,'^Rb'],
['^','','','Rc',0,0,'^Rc'],
['^','','','Rd',0,0,'^Rd'],
['^','','','Re',0,0,'^Re'],
['^','','','Rf',0,0,'^Rf'],
['^','','','Rg',0,0,'^Rg'],
['^','','','Rh',0,0,'^Rh'],
['^','','','Ri',0,0,'^Ri'],
['^','','','Rj',0,0,'^Rj'],
['^','','','Rk',0,0,'^Rk'],
['^','','','Rl',0,0,'^Rl'],
['^','','','Rm',0,0,'^Rm'],
['^','','','Rn',0,0,'^Rn'],
['^','','','Ro',0,0,'^Ro'],
['^','','','Rp',0,0,'^Rp'],
['^','','','Rq',0,0,'^Rq'],
['^','','','Rr',0,0,'^Rr'],
['^','','','Rs',0,0,'^Rs'],
['^','','','Rt',0,0,'^Rt'],
['^','','','Ru',0,0,'^Ru'],
['^','','','Rv',0,0,'^Rv'],
['^','','','Rw',0,0,'^Rw'],
['^','','','Rx',0,0,'^Rx'],
['^','','','Ry',0,0,'^Ry'],
['^','','','Rz',0,0,'^Rz'],
['^','','','RA',0,0,'^RA'],
['^','','','RB',0,0,'^RB'],
['^','','','RC',0,0,'^RC'],
['^','','','RD',0,0,'^RD'],
['^','','','RE',0,0,'^RE'],
['^','','','RF',0,0,'^RF'],
['^','','','RG',0,0,'^RG'],
['^','','','RH',0,0,'^RH'],
['^','','','RI',0,0,'^RI'],
['^','','','RJ',0,0,'^RJ'],
['^','','','RK',0,0,'^RK'],
['^','','','RL',0,0,'^RL'],
['^','','','RM',0,0,'^RM'],
['^','','','RN',0,0,'^RN'],
['^','','','RO',0,0,'^RO'],
['^','','','RP',0,0,'^RP'],
['^','','','RQ',0,0,'^RQ'],
['^','','','RR',0,0,'^RR'],
['^','','','RS',0,0,'^RS'],
['^','','','RT',0,0,'^RT'],
['^','','','RU',0,0,'^RU'],
['^','','','RV',0,0,'^RV'],
['^','','','RW',0,0,'^RW'],
['^','','','RX',0,0,'^RX'],
['^','','','RY',0,0,'^RY'],
['^','','','RZ',0,0,'^RZ'],
['^','','','Sa',0,0,'^Sa'],
['^','','','Sb',0,0,'^Sb'],
['^','','','Sc',0,0,'^Sc'],
['^','','','Sd',0,0,'^Sd'],
['^','','','Se',0,0,'^Se'],
['^','','','Sf',0,0,'^Sf'],
['^','','','Sg',0,0,'^Sg'],
['^','','','Sh',0,0,'^Sh'],
['^','','','Si',0,0,'^Si'],
['^','','','Sj',0,0,'^Sj'],
['^','','','Sk',0,0,'^Sk'],
['^','','','Sl',0,0,'^Sl'],
['^','','','Sm',0,0,'^Sm'],
['^','','','Sn',0,0,'^Sn'],
['^','','','So',0,0,'^So'],
['^','','','Sp',0,0,'^Sp'],
['^','','','Sq',0,0,'^Sq'],
['^','','','Sr',0,0,'^Sr'],
['^','','','Ss',0,0,'^Ss'],
['^','','','St',0,0,'^St'],
['^','','','Su',0,0,'^Su'],
['^','','','Sv',0,0,'^Sv'],
['^','','','Sw',0,0,'^Sw'],
['^','','','Sx',0,0,'^Sx'],
['^','','','Sy',0,0,'^Sy'],
['^','','','Sz',0,0,'^Sz'],
['^','','','SA',0,0,'^SA'],
['^','','','SB',0,0,'^SB'],
['^','','','SC',0,0,'^SC'],
['^','','','SD',0,0,'^SD'],
['^','','','SE',0,0,'^SE'],
['^','','','SF',0,0,'^SF'],
['^','','','SG',0,0,'^SG'],
['^','','','SH',0,0,'^SH'],
['^','','','SI',0,0,'^SI'],
['^','','','SJ',0,0,'^SJ'],
['^','','','SK',0,0,'^SK'],
['^','','','SL',0,0,'^SL'],
['^','','','SM',0,0,'^SM'],
['^','','','SN',0,0,'^SN'],
['^','','','SO',0,0,'^SO'],
['^','','','SP',0,0,'^SP'],
['^','','','SQ',0,0,'^SQ'],
['^','','','SR',0,0,'^SR'],
['^','','','SS',0,0,'^SS'],
['^','','','ST',0,0,'^ST'],
['^','','','SU',0,0,'^SU'],
['^','','','SV',0,0,'^SV'],
['^','','','SW',0,0,'^SW'],
['^','','','SX',0,0,'^SX'],
['^','','','SY',0,0,'^SY'],
['^','','','SZ',0,0,'^SZ'],
['^','','','Ta',0,0,'^Ta'],
['^','','','Tb',0,0,'^Tb'],
['^','','','Tc',0,0,'^Tc'],
['^','','','Td',0,0,'^Td'],
['^','','','Te',0,0,'^Te'],
['^','','','Tf',0,0,'^Tf'],
['^','','','Tg',0,0,'^Tg'],
['^','','','Th',0,0,'^Th'],
['^','','','Ti',0,0,'^Ti'],
['^','','','Tj',0,0,'^Tj'],
['^','','','Tk',0,0,'^Tk'],
['^','','','Tl',0,0,'^Tl'],
['^','','','Tm',0,0,'^Tm'],
['^','','','Tn',0,0,'^Tn'],
['^','','','To',0,0,'^To'],
['^','','','Tp',0,0,'^Tp'],
['^','','','Tq',0,0,'^Tq'],
['^','','','Tr',0,0,'^Tr'],
['^','','','Ts',0,0,'^Ts'],
['^','','','Tt',0,0,'^Tt'],
['^','','','Tu',0,0,'^Tu'],
['^','','','Tv',0,0,'^Tv'],
['^','','','Tw',0,0,'^Tw'],
['^','','','Tx',0,0,'^Tx'],
['^','','','Ty',0,0,'^Ty'],
['^','','','Tz',0,0,'^Tz'],
['^','','','TA',0,0,'^TA'],
['^','','','TB',0,0,'^TB'],
['^','','','TC',0,0,'^TC'],
['^','','','TD',0,0,'^TD'],
['^','','','TE',0,0,'^TE'],
['^','','','TF',0,0,'^TF'],
['^','','','TG',0,0,'^TG'],
['^','','','TH',0,0,'^TH'],
['^','','','TI',0,0,'^TI'],
['^','','','TJ',0,0,'^TJ'],
['^','','','TK',0,0,'^TK'],
['^','','','TL',0,0,'^TL'],
['^','','','TM',0,0,'^TM'],
['^','','','TN',0,0,'^TN'],
['^','','','TO',0,0,'^TO'],
['^','','','TP',0,0,'^TP'],
['^','','','TQ',0,0,'^TQ'],
['^','','','TR',0,0,'^TR'],
['^','','','TS',0,0,'^TS'],
['^','','','TT',0,0,'^TT'],
['^','','','TU',0,0,'^TU'],
['^','','','TV',0,0,'^TV'],
['^','','','TW',0,0,'^TW'],
['^','','','TX',0,0,'^TX'],
['^','','','TY',0,0,'^TY'],
['^','','','TZ',0,0,'^TZ'],
['^','','','Ua',0,0,'^Ua'],
['^','','','Ub',0,0,'^Ub'],
['^','','','Uc',0,0,'^Uc'],
['^','','','Ud',0,0,'^Ud'],
['^','','','Ue',0,0,'^Ue'],
['^','','','Uf',0,0,'^Uf'],
['^','','','Ug',0,0,'^Ug'],
['^','','','Uh',0,0,'^Uh'],
['^','','','Ui',0,0,'^Ui'],
['^','','','Uj',0,0,'^Uj'],
['^','','','Uk',0,0,'^Uk'],
['^','','','Ul',0,0,'^Ul'],
['^','','','Um',0,0,'^Um'],
['^','','','Un',0,0,'^Un'],
['^','','','Uo',0,0,'^Uo'],
['^','','','Up',0,0,'^Up'],
['^','','','Uq',0,0,'^Uq'],
['^','','','Ur',0,0,'^Ur'],
['^','','','Us',0,0,'^Us'],
['^','','','Ut',0,0,'^Ut'],
['^','','','Uu',0,0,'^Uu'],
['^','','','Uv',0,0,'^Uv'],
['^','','','Uw',0,0,'^Uw'],
['^','','','Ux',0,0,'^Ux'],
['^','','','Uy',0,0,'^Uy'],
['^','','','Uz',0,0,'^Uz'],
['^','','','UA',0,0,'^UA'],
['^','','','UB',0,0,'^UB'],
['^','','','UC',0,0,'^UC'],
['^','','','UD',0,0,'^UD'],
['^','','','UE',0,0,'^UE'],
['^','','','UF',0,0,'^UF'],
['^','','','UG',0,0,'^UG'],
['^','','','UH',0,0,'^UH'],
['^','','','UI',0,0,'^UI'],
['^','','','UJ',0,0,'^UJ'],
['^','','','UK',0,0,'^UK'],
['^','','','UL',0,0,'^UL'],
['^','','','UM',0,0,'^UM'],
['^','','','UN',0,0,'^UN'],
['^','','','UO',0,0,'^UO'],
['^','','','UP',0,0,'^UP'],
['^','','','UQ',0,0,'^UQ'],
['^','','','UR',0,0,'^UR'],
['^','','','US',0,0,'^US'],
['^','','','UT',0,0,'^UT'],
['^','','','UU',0,0,'^UU'],
['^','','','UV',0,0,'^UV'],
['^','','','UW',0,0,'^UW'],
['^','','','UX',0,0,'^UX'],
['^','','','UY',0,0,'^UY'],
['^','','','UZ',0,0,'^UZ'],
['^','','','Va',0,0,'^Va'],
['^','','','Vb',0,0,'^Vb'],
['^','','','Vc',0,0,'^Vc'],
['^','','','Vd',0,0,'^Vd'],
['^','','','Ve',0,0,'^Ve'],
['^','','','Vf',0,0,'^Vf'],
['^','','','Vg',0,0,'^Vg'],
['^','','','Vh',0,0,'^Vh'],
['^','','','Vi',0,0,'^Vi'],
['^','','','Vj',0,0,'^Vj'],
['^','','','Vk',0,0,'^Vk'],
['^','','','Vl',0,0,'^Vl'],
['^','','','Vm',0,0,'^Vm'],
['^','','','Vn',0,0,'^Vn'],
['^','','','Vo',0,0,'^Vo'],
['^','','','Vp',0,0,'^Vp'],
['^','','','Vq',0,0,'^Vq'],
['^','','','Vr',0,0,'^Vr'],
['^','','','Vs',0,0,'^Vs'],
['^','','','Vt',0,0,'^Vt'],
['^','','','Vu',0,0,'^Vu'],
['^','','','Vv',0,0,'^Vv'],
['^','','','Vw',0,0,'^Vw'],
['^','','','Vx',0,0,'^Vx'],
['^','','','Vy',0,0,'^Vy'],
['^','','','Vz',0,0,'^Vz'],
['^','','','VA',0,0,'^VA'],
['^','','','VB',0,0,'^VB'],
['^','','','VC',0,0,'^VC'],
['^','','','VD',0,0,'^VD'],
['^','','','VE',0,0,'^VE'],
['^','','','VF',0,0,'^VF'],
['^','','','VG',0,0,'^VG'],
['^','','','VH',0,0,'^VH'],
['^','','','VI',0,0,'^VI'],
['^','','','VJ',0,0,'^VJ'],
['^','','','VK',0,0,'^VK'],
['^','','','VL',0,0,'^VL'],
['^','','','VM',0,0,'^VM'],
['^','','','VN',0,0,'^VN'],
['^','','','VO',0,0,'^VO'],
['^','','','VP',0,0,'^VP'],
['^','','','VQ',0,0,'^VQ'],
['^','','','VR',0,0,'^VR'],
['^','','','VS',0,0,'^VS'],
['^','','','VT',0,0,'^VT'],
['^','','','VU',0,0,'^VU'],
['^','','','VV',0,0,'^VV'],
['^','','','VW',0,0,'^VW'],
['^','','','VX',0,0,'^VX'],
['^','','','VY',0,0,'^VY'],
['^','','','VZ',0,0,'^VZ'],
['^','','','Wa',0,0,'^Wa'],
['^','','','Wb',0,0,'^Wb'],
['^','','','Wc',0,0,'^Wc'],
['^','','','Wd',0,0,'^Wd'],
['^','','','We',0,0,'^We'],
['^','','','Wf',0,0,'^Wf'],
['^','','','Wg',0,0,'^Wg'],
['^','','','Wh',0,0,'^Wh'],
['^','','','Wi',0,0,'^Wi'],
['^','','','Wj',0,0,'^Wj'],
['^','','','Wk',0,0,'^Wk'],
['^','','','Wl',0,0,'^Wl'],
['^','','','Wm',0,0,'^Wm'],
['^','','','Wn',0,0,'^Wn'],
['^','','','Wo',0,0,'^Wo'],
['^','','','Wp',0,0,'^Wp'],
['^','','','Wq',0,0,'^Wq'],
['^','','','Wr',0,0,'^Wr'],
['^','','','Ws',0,0,'^Ws'],
['^','','','Wt',0,0,'^Wt'],
['^','','','Wu',0,0,'^Wu'],
['^','','','Wv',0,0,'^Wv'],
['^','','','Ww',0,0,'^Ww'],
['^','','','Wx',0,0,'^Wx'],
['^','','','Wy',0,0,'^Wy'],
['^','','','Wz',0,0,'^Wz'],
['^','','','WA',0,0,'^WA'],
['^','','','WB',0,0,'^WB'],
['^','','','WC',0,0,'^WC'],
['^','','','WD',0,0,'^WD'],
['^','','','WE',0,0,'^WE'],
['^','','','WF',0,0,'^WF'],
['^','','','WG',0,0,'^WG'],
['^','','','WH',0,0,'^WH'],
['^','','','WI',0,0,'^WI'],
['^','','','WJ',0,0,'^WJ'],
['^','','','WK',0,0,'^WK'],
['^','','','WL',0,0,'^WL'],
['^','','','WM',0,0,'^WM'],
['^','','','WN',0,0,'^WN'],
['^','','','WO',0,0,'^WO'],
['^','','','WP',0,0,'^WP'],
['^','','','WQ',0,0,'^WQ'],
['^','','','WR',0,0,'^WR'],
['^','','','WS',0,0,'^WS'],
['^','','','WT',0,0,'^WT'],
['^','','','WU',0,0,'^WU'],
['^','','','WV',0,0,'^WV'],
['^','','','WW',0,0,'^WW'],
['^','','','WX',0,0,'^WX'],
['^','','','WY',0,0,'^WY'],
['^','','','WZ',0,0,'^WZ'],
['^','','','Xa',0,0,'^Xa'],
['^','','','Xb',0,0,'^Xb'],
['^','','','Xc',0,0,'^Xc'],
['^','','','Xd',0,0,'^Xd'],
['^','','','Xe',0,0,'^Xe'],
['^','','','Xf',0,0,'^Xf'],
['^','','','Xg',0,0,'^Xg'],
['^','','','Xh',0,0,'^Xh'],
['^','','','Xi',0,0,'^Xi'],
['^','','','Xj',0,0,'^Xj'],
['^','','','Xk',0,0,'^Xk'],
['^','','','Xl',0,0,'^Xl'],
['^','','','Xm',0,0,'^Xm'],
['^','','','Xn',0,0,'^Xn'],
['^','','','Xo',0,0,'^Xo'],
['^','','','Xp',0,0,'^Xp'],
['^','','','Xq',0,0,'^Xq'],
['^','','','Xr',0,0,'^Xr'],
['^','','','Xs',0,0,'^Xs'],
['^','','','Xt',0,0,'^Xt'],
['^','','','Xu',0,0,'^Xu'],
['^','','','Xv',0,0,'^Xv'],
['^','','','Xw',0,0,'^Xw'],
['^','','','Xx',0,0,'^Xx'],
['^','','','Xy',0,0,'^Xy'],
['^','','','Xz',0,0,'^Xz'],
['^','','','XA',0,0,'^XA'],
['^','','','XB',0,0,'^XB'],
['^','','','XC',0,0,'^XC'],
['^','','','XD',0,0,'^XD'],
['^','','','XE',0,0,'^XE'],
['^','','','XF',0,0,'^XF'],
['^','','','XG',0,0,'^XG'],
['^','','','XH',0,0,'^XH'],
['^','','','XI',0,0,'^XI'],
['^','','','XJ',0,0,'^XJ'],
['^','','','XK',0,0,'^XK'],
['^','','','XL',0,0,'^XL'],
['^','','','XM',0,0,'^XM'],
['^','','','XN',0,0,'^XN'],
['^','','','XO',0,0,'^XO'],
['^','','','XP',0,0,'^XP'],
['^','','','XQ',0,0,'^XQ'],
['^','','','XR',0,0,'^XR'],
['^','','','XS',0,0,'^XS'],
['^','','','XT',0,0,'^XT'],
['^','','','XU',0,0,'^XU'],
['^','','','XV',0,0,'^XV'],
['^','','','XW',0,0,'^XW'],
['^','','','XX',0,0,'^XX'],
['^','','','XY',0,0,'^XY'],
['^','','','XZ',0,0,'^XZ'],
['^','','','Za',0,0,'^Za'],
['^','','','Zb',0,0,'^Zb'],
['^','','','Zc',0,0,'^Zc'],
['^','','','Zd',0,0,'^Zd'],
['^','','','Ze',0,0,'^Ze'],
['^','','','Zf',0,0,'^Zf'],
['^','','','Zg',0,0,'^Zg'],
['^','','','Zh',0,0,'^Zh'],
['^','','','Zi',0,0,'^Zi'],
['^','','','Zj',0,0,'^Zj'],
['^','','','Zk',0,0,'^Zk'],
['^','','','Zl',0,0,'^Zl'],
['^','','','Zm',0,0,'^Zm'],
['^','','','Zn',0,0,'^Zn'],
['^','','','Zo',0,0,'^Zo'],
['^','','','Zp',0,0,'^Zp'],
['^','','','Zq',0,0,'^Zq'],
['^','','','Zr',0,0,'^Zr'],
['^','','','Zs',0,0,'^Zs'],
['^','','','Zt',0,0,'^Zt'],
['^','','','Zu',0,0,'^Zu'],
['^','','','Zv',0,0,'^Zv'],
['^','','','Zw',0,0,'^Zw'],
['^','','','Zx',0,0,'^Zx'],
['^','','','Zy',0,0,'^Zy'],
['^','','','Zz',0,0,'^Zz'],
['^','','','ZA',0,0,'^ZA'],
['^','','','ZB',0,0,'^ZB'],
['^','','','ZC',0,0,'^ZC'],
['^','','','ZD',0,0,'^ZD'],
['^','','','ZE',0,0,'^ZE'],
['^','','','ZF',0,0,'^ZF'],
['^','','','ZG',0,0,'^ZG'],
['^','','','ZH',0,0,'^ZH'],
['^','','','ZI',0,0,'^ZI'],
['^','','','ZJ',0,0,'^ZJ'],
['^','','','ZK',0,0,'^ZK'],
['^','','','ZL',0,0,'^ZL'],
['^','','','ZM',0,0,'^ZM'],
['^','','','ZN',0,0,'^ZN'],
['^','','','ZO',0,0,'^ZO'],
['^','','','ZP',0,0,'^ZP'],
['^','','','ZQ',0,0,'^ZQ'],
['^','','','ZR',0,0,'^ZR'],
['^','','','ZS',0,0,'^ZS'],
['^','','','ZT',0,0,'^ZT'],
['^','','','ZU',0,0,'^ZU'],
['^','','','ZV',0,0,'^ZV'],
['^','','','ZW',0,0,'^ZW'],
['^','','','ZX',0,0,'^ZX'],
['^','','','ZY',0,0,'^ZY'],
['^','','','ZZ',0,0,'^ZZ'],
['^','','','Ya',0,0,'^Ya'],
['^','','','Yb',0,0,'^Yb'],
['^','','','Yc',0,0,'^Yc'],
['^','','','Yd',0,0,'^Yd'],
['^','','','Ye',0,0,'^Ye'],
['^','','','Yf',0,0,'^Yf'],
['^','','','Yg',0,0,'^Yg'],
['^','','','Yh',0,0,'^Yh'],
['^','','','Yi',0,0,'^Yi'],
['^','','','Yj',0,0,'^Yj'],
['^','','','Yk',0,0,'^Yk'],
['^','','','Yl',0,0,'^Yl'],
['^','','','Ym',0,0,'^Ym'],
['^','','','Yn',0,0,'^Yn'],
['^','','','Yo',0,0,'^Yo'],
['^','','','Yp',0,0,'^Yp'],
['^','','','Yq',0,0,'^Yq'],
['^','','','Yr',0,0,'^Yr'],
['^','','','Ys',0,0,'^Ys'],
['^','','','Yt',0,0,'^Yt'],
['^','','','Yu',0,0,'^Yu'],
['^','','','Yv',0,0,'^Yv'],
['^','','','Yw',0,0,'^Yw'],
['^','','','Yx',0,0,'^Yx'],
['^','','','Yy',0,0,'^Yy'],
['^','','','Yz',0,0,'^Yz'],
['^','','','YA',0,0,'^YA'],
['^','','','YB',0,0,'^YB'],
['^','','','YC',0,0,'^YC'],
['^','','','YD',0,0,'^YD'],
['^','','','YE',0,0,'^YE'],
['^','','','YF',0,0,'^YF'],
['^','','','YG',0,0,'^YG'],
['^','','','YH',0,0,'^YH'],
['^','','','YI',0,0,'^YI'],
['^','','','YJ',0,0,'^YJ'],
['^','','','YK',0,0,'^YK'],
['^','','','YL',0,0,'^YL'],
['^','','','YM',0,0,'^YM'],
['^','','','YN',0,0,'^YN'],
['^','','','YO',0,0,'^YO'],
['^','','','YP',0,0,'^YP'],
['^','','','YQ',0,0,'^YQ'],
['^','','','YR',0,0,'^YR'],
['^','','','YS',0,0,'^YS'],
['^','','','YT',0,0,'^YT'],
['^','','','YU',0,0,'^YU'],
['^','','','YV',0,0,'^YV'],
['^','','','YW',0,0,'^YW'],
['^','','','YX',0,0,'^YX'],
['^','','','YY',0,0,'^YY'],
['^','','','YZ',0,0,'^YZ'],
				*/
			];
			
			var Range = [
				["^personal$","personal",1,"^1$"],
				["^touch$","touch",2,"^2$"],
				["^close$","close",3,"^3$"],
				["^medium$","medium",4,"^4$"],
				["^long$","long",5,"^5$"]
			];

			var ArmorType = [
				["^Light$","Light", 1,"^1$"],
				["^Medium$","Medium", 2,"^2$"],
				["^Heavy$","Heavy", 3,"^3$"]
			];

			var Stats = [
				["^STR$","STR",1,"^1$"],
				["^DEX$","DEX",2,"^2$"],
				["^CON$","CON",3,"^3$"],
				["^INT$","INT",4,"^4$"],
				["^WIS$","WIS",5,"^5$"],
				["^CHA$","CHA",6,"^6$"]
			];

			var Boolean = [
				["^true$", "true", 1,"^1$"],
				["^false$", "false", 0,"^0$"]
			];
			
			var NumberShort =
				['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
			
			var NumberLong = null;
			
			this.Number = function()
			{
				if (NumberLong == null)
				{
					var numberArray = new Array();
					for (var i = 0; i < NumberShort.length; i++) {
						for (var j = 0; j < NumberShort.length; j++) {
							numberArray[i * NumberShort.length + j] = NumberShort[i] + NumberShort[j];
						}
					}
					
					NumberLong = numberArray;
				}
				
				return NumberLong;
			}
			
			
			
			switch(name.toLowerCase()) {
				case "beginning":	return Beginning[VERSION_CURRENT];
				case "numbershort":	return NumberShort;
				case "range":		return Range;
				case "armortype": 	return ArmorType;
				case "stats": 		return Stats;
				case "boolean": 	return Boolean;
				default: 			return null;
			}
		}
	}

	var splitUri = function(uriString)
	{
		return uriString.match('^([^\\?]+\\?)(.+)$');
	}
	
	//#endregion Private
	
	//#region Public
	
	this.pack_all = function(uriParamString) {
		var keyValueArray = splitUri(uriParamString);
		var packed = packAll(keyValueArray[2], true);
		
		if(packed == null)
		{
			return null;
		}
		
		return keyValueArray[1] + packed;
	}
	
	this.pack = function(key, value) {
		if(key.match(regExpSanityFirstCapital) != null)
		{
			console.err("pack: Key started with capital letter");
			return null;
		}
		
		var pair = packKeyValuePair(key + "=" + value, true);
		return pair.key + pair.value;
	}
	
	this.unpack_all = function(packedString) {
		var keyValueArray = splitUri(packedString);
		var unpacked = unpackAll(keyValueArray[2], true)
		
		if(unpacked == null)
		{
			return null;
		}
		
		return keyValueArray[1] + unpacked;
	}
	
	this.unpack = function(packedString) {
		if(packedString.match(regExpSanityFirstCapital) == null)
		{
			console.err("pack: Key did not start with capital letter");
			return null;
		}
		
		var unpackedString = unpackKeyValuePair(packedString, true);
		var valuePair = {
			key: unpackedString.key,
			value: unpackedString.value
		}
		return valuePair;
	}
	
	//#endregion Public
}