var samples = 0;
var formErrors = false;
var showDownloadBox = true;
var renderDownloadTile = true;
var targetBarcodedCells = 100000;

var fieldData = {
    numberOfWells: [],
    targetedNumberOfBarcodedCells: {},
	diluentPerIntermediate: [],
	dilutionVolume: [],
	correctedSample: [],
	samplePerInputWell: [],
	samplePerWellDead: [],
	sampleLocation: [],
	totalDiluent: [],
	minDiluentNeeded: 0
};

var plateConfiguration = {
	numberOfWells: {},
	timesSampleCalled: {}
}


document.addEventListener( 'DOMContentLoaded', function(e) {
	add_event('#step-submit-1','click',step_submit_1);
	add_event('#step-submit-2','click',step_submit_2);
	add_event('#number-of-samples','keyup',number_of_samples_update);
	add_event('#number-of-barcoded-cells','blur',targeted_number_barcoded_cells_update);
	add_event('#download-csv','click',download_csv);
	add_event('.restrict-to-numbers','keydown',restrict_to_numbers);
	
	document.getElementById('number-of-samples').focus();		//TODO: An unrelated error seems to be stealing focus.
});


function worksheet_input_update(){
	//Note: The order here is important, since some many of these rely on previous calculations
	calculate_number_barcoded_cells_row()
	.then(calculate_number_of_wells)
	.then(calculate_sample_concentration_row)
	.then(calculate_volume_of_sample_stock_dilution)
	.then(calculate_number_of_wells_k)
	.then(calculate_volume_of_sample_dilution_buffer)
	.then(calculate_number_of_sample_wells)
	.then(calculate_number_of_times_sample_called)
	.then(calculate_sample_per_input_well)
	.then(calculate_sample_per_intermediate)
	.then(calculate_corrected_sample)
	.then(calculate_diluent_per_intermediate)
	.then(calculate_total_diluent)
	.then(calculate_min_diluent)
	.then(calculate_required_number_of_sample_dilution_tubes)
	.then(calculate_sample_per_well_dead)
	.then(calculate_sample_number)
	.then(calculate_sample_times_called)
	.then(calculate_location)
	.then(loading_table_update_sample_names)
	.then(loading_table_update_min_sample_stock_needed)
	.then(calculate_plate_configuration_values)
	.then(render_plate_configuration)
	.then(create_export_table)
	.then(validate_inputs)
	.then(show_hide_elements);
	
}

function step_submit_1(e){
	e.preventDefault();
	if (samples > 0){
		show('#sample-information-tile');
		remove_class('#arrow-box-1','current');
		add_class('#arrow-box-1','complete');
		add_class('#arrow-box-2','current');
	}
}

function step_submit_2(e){
	e.preventDefault();
	if (renderDownloadTile == true){
		show('#download-tile');
		show('#worksheet-data');
		
		add_class('#arrow-box-2','complete');
		
		remove_class('#arrow-box-2','current');
		add_class('#arrow-box-3','current');
	}
	else{
		hide('#download-tile');
		hide('#worksheet-data');
	}
}

function targeted_number_barcoded_cells_update(){
	targetBarcodedCells = get_value('#number-of-barcoded-cells');
	
	calculate_number_barcoded_cells_row();
}

function number_of_samples_update(e){
	e.preventDefault();
	
	var previousSamples = samples;
	samples = get_value('#number-of-samples');
	
	var rowsToAdd = samples - previousSamples;
	
	if (samples > 0){
		document.getElementById('step-submit-1').disabled = false;
	}
	
	//If adding rows:
		if (rowsToAdd>0){
			var output = "";
			var outputUserInput = "";
			
			for (let i=0;i<rowsToAdd;i++){
				var rowNum = Number(previousSamples) + i + 1;
				
				outputUserInput += "<tr id='row-"+rowNum+"'>";
				outputUserInput += "<td>"+rowNum+"</td>";
				outputUserInput += "<td><input type='text' id='sample-name-"+rowNum+"' class='worksheet-input input-width-100-percent' value='Sample "+rowNum+"' /></td>";
				outputUserInput += "<td><input type='text' id='percent-of-library-"+rowNum+"' class='worksheet-input restrict-to-numbers percent-of-library input-width-100-percent' /></td>";
				outputUserInput += "<td><input type='text' id='stock-concentration-"+rowNum+"' class='worksheet-input worksheet-input-validate restrict-to-numbers input-width-100-percent' value='10,000' /></td>";
				outputUserInput += "</tr>";
				
				output += "<tr id='sample-loading-table-row-"+rowNum+"'>";
				output += "<td>"+rowNum+"</td>";			
				output += "<td><input type='text' disabled id='table-sample-name-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='table-percent-of-library-"+rowNum+"' class='worksheet-input percent-of-library input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='table-stock-concentration-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='number-of-wells-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='targeted-number-barcoded-cells-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='sample-concentration-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='volume-of-sample-stock-dilution-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='number-of-wells-k-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='volume-of-sample-dilution-buffer-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='sample-number-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='number-of-sample-wells-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='number-of-times-sample-called-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='sample-per-well-dead-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='sample-per-input-well-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='sample-per-intermediate-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='diluent-per-intermediate-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='total-diluent-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='corrected-sample-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "<td><input type='text' disabled id='location-"+rowNum+"' class='worksheet-input input-width-100-percent' /></td>";
				output += "</tr>";
			}
			append_html('#samples-table-body',output);
			append_html('#samples-table-user-input-body',outputUserInput);
			
			//Add events:
				add_event('.worksheet-input','blur',worksheet_input_update);
				add_event('.worksheet-input-validate','keyup',worksheet_input_update_validate);
				add_event('.restrict-to-numbers','keydown',restrict_to_numbers);
			
			calculate_number_barcoded_cells_row();
		}
		
	//If removing rows:
		else{
			
			for (let b=previousSamples;b>previousSamples - Math.abs(rowsToAdd);b--){
				remove_elements('#row-'+b);
				remove_elements('#sample-loading-table-row-'+b);
				
				//Recalculate everything now that there are fewer samples:
					worksheet_input_update();
			}
			
			
		}
	
}


function restrict_to_numbers(event){
	const allowedKeys = [
		'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', // control keys
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', // numbers
		'.', '%',',' // period, commas, and percent
	  ];

	  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
	  if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
		return;
	  }

	  if (!allowedKeys.includes(event.key)) {
		event.preventDefault();
	  }
}

function worksheet_input_update_validate(){
	/* This basically just looks to see if the 'next step' button can be enabled, based on the keyup of relevant text boxes */
	validate_inputs()
	.then(show_hide_elements);
}

async function calculate_number_barcoded_cells_row(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			
			var rowPercentRaw = get_value('#percent-of-library-'+i);
			var rowPercent = Number(rowPercentRaw.replace('%', '')) / 100;
			
			//Update the percent value in the sample loading table:
				if (rowPercent){
					set_value('#table-percent-of-library-'+i,rowPercentRaw);
				}
			
			var numberBarcodedCells = rowPercent * targetBarcodedCells;
			set_value('#targeted-number-barcoded-cells-'+i,numberBarcodedCells);
		}
		resolve();
	});
}



async function calculate_number_of_wells(){
	//TODO: There is some logic regarding "ReferenceTable" in the spreadsheet cell, which determins how to round.  Need to look into that again.
	//For now, we're just rounding down.
	
	return new Promise((resolve) => {
		
		var totalWells = 0;
		for (let i=1;i<=samples;i++){
			//var percentOfLibrary = Number(get_value('#percent-of-library-'+i)) / 100;	//Column C
			var percentOfLibraryString = get_value('#percent-of-library-'+i);
			var percentOfLibrary = parseFloat(percentOfLibraryString.replace('%', '')) /100;
			var numWells = Math.floor(percentOfLibrary * 48);	
			
			fieldData['numberOfWells'][i] = numWells;
			
			totalWells += numWells;
			set_value('#number-of-wells-'+i,numWells);
		}
		
		//Check to make sure that the total of all rows equals 48.  If not, adjust row one up or down to get it equal
				if (totalWells){
					var newWellsRowOne = Number(fieldData['numberOfWells'][1]) + (48 - totalWells);
					set_value('#number-of-wells-1',newWellsRowOne);
					
					//If there is a change here, recalculate everything again:
					if (newWellsRowOne != fieldData['numberOfWells'][1]){
						
						
						fieldData['numberOfWells'][1] = newWellsRowOne;
						
						//worksheet_input_update();
					}
					
					
				}
		
		
		resolve();
	});
}


async function calculate_sample_concentration_row(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			var numBarcodedCells = get_value('#targeted-number-barcoded-cells-'+i);
			var numWells = fieldData['numberOfWells'][i];													//Column E
			
			if (numWells){
				var concentration = Math.floor(numBarcodedCells / (192.2 * (numWells / 48)));
				set_value('#sample-concentration-'+i,concentration);
			}
		}
		resolve();
	});
}


async function calculate_volume_of_sample_stock_dilution(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			
			var stockConcentration = Number(remove_commas(get_value('#stock-concentration-'+i)));							//Column D
			var requiredSampleConcentration = Number(get_value('#sample-concentration-'+i));		//Column G	
			var numberOfWells = fieldData['numberOfWells'][i];																//Column E
			var volumeOfSampleStockDilution = 0;
			
			//Update stock concentration in sample loading table:
				if (stockConcentration){
					set_value('#table-stock-concentration-'+i,stockConcentration);
				}
			
			if (stockConcentration > requiredSampleConcentration){
				if ((requiredSampleConcentration * 15.6 / stockConcentration) < 5){
					volumeOfSampleStockDilution =  (5 * numberOfWells * 1.4).toFixed(2);
				}
				else{
					volumeOfSampleStockDilution =  ((requiredSampleConcentration * 15.6 / stockConcentration) * numberOfWells * 1.4).toFixed(2);
				}
			}
			else{
				volumeOfSampleStockDilution =  (numberOfWells * 15.6 * 1.4).toFixed(2);
			}
			
			set_value('#volume-of-sample-stock-dilution-'+i,volumeOfSampleStockDilution);
			
		}
		
		resolve();
	});
}

async function calculate_number_of_wells_k(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			var volumeOfSampleStockDilution =  Number(get_value('#volume-of-sample-stock-dilution-'+i));//Column J
			var numWells = Math.ceil(volumeOfSampleStockDilution / 200);
			set_value('#number-of-wells-k-'+i,numWells);
		}
		resolve();
	});
}

async function calculate_volume_of_sample_dilution_buffer(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			var volumeOfSampleStockDilution =  Number(get_value('#volume-of-sample-stock-dilution-'+i).replace(/,/g, ""));		//Column J
			var stockConcentration = Number(remove_commas(get_value('#stock-concentration-'+i)));												//Column D
			var requiredSampleConcentration = Number(get_value('#sample-concentration-'+i).replace(/,/g, ""));							//Column G	
				
			var volumeOfSampleDilutionBuffer = (volumeOfSampleStockDilution * stockConcentration / requiredSampleConcentration - volumeOfSampleStockDilution).toFixed(2);
			
			set_value('#volume-of-sample-dilution-buffer-'+i,volumeOfSampleDilutionBuffer);
		}
		resolve();
	});
}


async function calculate_number_of_sample_wells(){	//Column O
	return new Promise((resolve) => {
		//TODO: Is this really as easy as setting it ot the value of column K?
		for (let i=1;i<=samples;i++){
			var numberOfWellsK =  Number(get_value('#number-of-wells-k-'+i));		//Column K
			set_value('#number-of-sample-wells-'+i,numberOfWellsK);
		}
		resolve();
	});
}

async function calculate_number_of_times_sample_called(){	//Column P
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			
		}
		resolve();
	});
}


async function calculate_corrected_sample(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			
			var sampleValuePerIntermediate = Number(get_value('#sample-per-intermediate-'+i));
			var subWells = Number(get_value('#number-of-wells-'+i));
			var correctedSample;
			
			if (subWells > 0){
				if (sampleValuePerIntermediate < 5){
					correctedSample = 5;
				}
				else{
					correctedSample = sampleValuePerIntermediate;
				}
			}
			else{
				correctedSample = 0;
			}
			
			set_value('#corrected-sample-'+i,correctedSample);
			fieldData['correctedSample'][i] = correctedSample;
		}
		resolve();
	});
}


async function calculate_diluent_per_intermediate(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			var correctedSample 			= Number(get_value('#corrected-sample-'+i));				// Column X
			var stockConcentration 		= Number(remove_commas(get_value('#stock-concentration-'+i)));		// Column R / D
			var reqConcentration 			= Number(get_value('#sample-concentration-'+i)); 		// Column S
			
			var diluentPerIntermediate = correctedSample * stockConcentration / reqConcentration - correctedSample;
			
			if (diluentPerIntermediate < 1){
				diluentPerIntermediate = 0;
			}
			else if (diluentPerIntermediate < 2){
				diluentPerIntermediate = 2;
			}
			
			set_value('#diluent-per-intermediate-'+i,diluentPerIntermediate.toFixed(2));
			
			fieldData['diluentPerIntermediate'][i] = Number(diluentPerIntermediate.toFixed(2));
		}
		resolve();
	});
}

async function calculate_sample_per_intermediate(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){	
			var samplePerInputWell = Number(get_value('#sample-per-input-well-'+i));			//Column U 
			//var subWells = Number(get_value('#number-of-wells-'+i));									//Column T //E
			var subWells = fieldData['numberOfWells'][i];															//Column T //E
			var samplePerIntermediate = (samplePerInputWell / subWells);
			
			set_value('#sample-per-intermediate-'+i,samplePerIntermediate.toFixed(2));
		}
		resolve();
	});
}

async function calculate_sample_per_input_well(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			var stockConcentration 			= Number(remove_commas(get_value('#stock-concentration-'+i)));						//Column D
			var requiredConcentration 		= Number(get_value('#sample-concentration-'+i));					//Column G
			var numberOfWells					= Number(get_value('#number-of-wells-'+i));							//Column E
			var samplePerInputWell 			= 0;
		
			if (stockConcentration > requiredConcentration){
				samplePerInputWell = (requiredConcentration * 15.6 /  stockConcentration) * numberOfWells;
			}
			else{
				samplePerInputWell = 15.6 * numberOfWells;
			}
			
			set_value('#sample-per-input-well-'+i,samplePerInputWell.toFixed(2));
			fieldData['samplePerInputWell'][i] = Number(samplePerInputWell.toFixed(2));
		}
		resolve();
	});
}

async function calculate_total_diluent(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			var diluentPerIntermediate = Number(get_value('#diluent-per-intermediate-'+i));						//Column Y
			var numWells = fieldData['numberOfWells'][i];
			var totalDiluent = diluentPerIntermediate * numWells;
			
			set_value('#total-diluent-'+i,totalDiluent.toFixed(2));
			fieldData['totalDiluent'][i] = totalDiluent.toFixed(2);
	
		}
		resolve();
	});
}

async function calculate_min_diluent(){
	return new Promise((resolve) => {
		var minDiluent = 0;
		for (let i=1;i<=samples;i++){
			var totalDiluent = Number(get_value('#total-diluent-'+i));
			minDiluent += totalDiluent;
		}
		
		set_value('#min-diluent-needed',Math.ceil(minDiluent));
		 
		fieldData['minDiluentNeeded'] = Math.ceil(minDiluent);
	
		resolve();
	});	
}


async function calculate_required_number_of_sample_dilution_tubes(){
	return new Promise((resolve) => {
		
		var requiredNumberSampleDilutionTubes =  Math.ceil(fieldData['minDiluentNeeded'] / 1500);
		if (requiredNumberSampleDilutionTubes){
			
			set_value('#required-number-of-sample-dilution-tubes',requiredNumberSampleDilutionTubes);
		
			//Update the sample dilution tubes graphic:
				if(imgPath){
					replace_html('#sample-dilution-tube-locations','<img src="'+imgPath+'deck-layout-'+requiredNumberSampleDilutionTubes+'.svg" />');
				}
				else{
					replace_html('#sample-dilution-tube-locations','<img src="'+siteUrl+'/wp-content/themes/parse-bioscience/pages/sample-loading-table/sample-loading-table-worksheet/images/deck-layout-'+requiredNumberSampleDilutionTubes+'.svg" />');
				}
		}
		
		resolve();
	});	
}

async function calculate_sample_per_well_dead(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			if (fieldData['samplePerInputWell'][i] / fieldData['numberOfWells'][i] < 5){
				fieldData['samplePerWellDead'][i] = number_round(fieldData['numberOfWells'][i] * 5  * 1.4);
			}
			else{
				fieldData['samplePerWellDead'][i] = number_round(fieldData['samplePerInputWell'][i]  * 1.4);
			}
			set_value('#sample-per-well-dead-'+i,fieldData['samplePerWellDead'][i]);
		}
		resolve();
	});	
}

async function calculate_sample_number(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			set_value('#sample-number-'+i,i);
		}
		resolve();
	});	
}

async function calculate_sample_times_called(){
	return new Promise((resolve) => {
		for (let i=1;i<=samples;i++){
			set_value('#number-of-times-sample-called-'+i,1);
		}
		resolve();
	});	
}


/* Loading Table */
	async function loading_table_update_sample_names(){
		return new Promise((resolve) => {
			for (let i=1;i<=samples;i++){
				var sampleName = get_value('#sample-name-'+i);
				set_value('#loading-table-sample-name-'+i,sampleName);
				set_value('#table-sample-name-'+i,sampleName);
			}
			resolve();
		});
	}

	async function loading_table_update_min_sample_stock_needed(){
		return new Promise((resolve) => {
			for (let i=1;i<=samples;i++){
				set_value('#loading-table-sample-needed-dilution-'+i,get_value('#volume-of-sample-stock-dilution-'+i));
			}
			resolve();
		});
	}
/* Loading Table */	


/* Plate Configuration Table */
	async function calculate_plate_configuration_values(){
		return new Promise((resolve) => {
			set_value('#plate-configuration-sample-number-1',1);
			set_value('#plate-configuration-wells-1',fieldData['numberOfWells'][1]);
			set_value('#plate-configuration-times-sample-called-1',1);
			
			var currentMaxWells = fieldData['numberOfWells'][1];
			var timesSampledCalled = 1;
			var arrayValue = 1;			//This just is used to reference the current number of wells in the fieldData['numberOfWells'].  Once the maximum number of wells is reached, we move to the next value in the array
			
			for (let i=2;i<=48;i++){
				//Calculate times sample has been called:
				timesSampledCalled++;
				set_value('#plate-configuration-times-sample-called-'+i,timesSampledCalled);
				
				if (timesSampledCalled == currentMaxWells){
					arrayValue++;
					currentMaxWells = fieldData['numberOfWells'][arrayValue];
					timesSampledCalled = 0;
				}
				
			}
			resolve();
		});
	}
	
	async function render_plate_configuration(){
		return new Promise((resolve) => {
			
			var currentMaxWells = fieldData['numberOfWells'][1];
			var timesSampledCalled = 0;
			var arrayValue = 1;			//This just is used to reference the current number of wells in the fieldData['numberOfWells'].  Once the maximum number of wells is reached, we move to the next value in the array
			var row = 1;
			var col = 1;
			
			for (let i=2;i<=49;i++){
				//Calculate times sample has been called:
				timesSampledCalled++;
				
				set_value('#plate-configuration-'+row+'-'+col,arrayValue);
				if (arrayValue){
					document.getElementById('plate-configuration-cell-'+row+'-'+col).className = '';
					add_class('#plate-configuration-cell-'+row+'-'+col,'plate-configuration-sample-'+arrayValue);
				}
				
				if (timesSampledCalled == currentMaxWells){
					arrayValue++;
					currentMaxWells = fieldData['numberOfWells'][arrayValue];
					timesSampledCalled = 0;
				}
				
				col++;
				if (col > 12){
					row++;
					col = 1;
				}
				
			}
			resolve();
			
		});
	}
	
	async function calculate_location(){
		return new Promise((resolve) => {
			
			var currentTargetWell = ["A","B","C","D","E","F","G"];
			var currentTargetWellKey = 0;
			var currentTargetWellNumber = 1;
			
			for (let i=1;i<=samples;i++){
				
				fieldData['sampleLocation'][i] = currentTargetWell[currentTargetWellKey]+currentTargetWellNumber;
				set_value('#location-'+i,currentTargetWell[currentTargetWellKey]+currentTargetWellNumber);
				
				currentTargetWellNumber++
				if (currentTargetWellNumber > 12){
					currentTargetWellNumber = 1;
					currentTargetWellKey++;
				}
			}

			resolve();
		});
	}
	
	
	
	async function validate_inputs(){
		return new Promise((resolve) => {
			var showErrorBox = false;
			var errorMessage = "";
			var percentOfLibraryTotal = 0;
			var percentageBoxesComplete = 0;
			showDownloadBox = true;		//Reset
			
			//Percent of Library Checks:
				for (let i=1;i<=samples;i++){
					let percentOfLibrary = Number(get_value('#percent-of-library-'+i).replace('%', ''));
					if (percentOfLibrary){
						percentageBoxesComplete++;
					}
					if (percentOfLibrary && percentOfLibrary < 2.09){
						showErrorBox = true;
						showDownloadBox = false;
						errorMessage += '<div><i class="saphire-icon saphire-icons-ico-exclamation-circle" aria-hidden="true"></i> No individual "Percentage of Library" percentage may be lower than 2.09%</div>';
					}
					percentOfLibraryTotal += percentOfLibrary;
					
					replace_html('#percent-of-library-total',percentOfLibraryTotal+"%");
				}
				
				if (percentageBoxesComplete == samples && percentOfLibraryTotal != 100){
					showErrorBox = true;
					showDownloadBox = false;
					errorMessage += '<div><i class="saphire-icon saphire-icons-ico-exclamation-circle" aria-hidden="true"></i> "Percentage of Library" percentages must add to 100%</div>';
					
					//Highlight the problem inputs:
						add_class('#sample-information-tile','error-100-percent');
				}
				else{
					remove_class('#sample-information-tile','error-100-percent');
				}
				
			//Check that values exist for all stock concentration fields:
				for (let i=1;i<=samples;i++){
					var stockConcentration = get_value(remove_commas('#stock-concentration-'+i));
					if (!stockConcentration){
						showDownloadBox = false;
					}
				}
				
			//Diluent Check:
				var totalDiluent = 0;
				for (let i=1;i<=samples;i++){
					totalDiluent += Number(fieldData['totalDiluent'][i]);
				}
				if ((totalDiluent * 1.3) > 1800){
					showErrorBox = true;
					errorMessage += '<div><i class="saphire-icon saphire-icons-ico-exclamation-circle" aria-hidden="true"></i> "Diluent volumes too high. Extra sample dilution tubes required.</div>';				
				}
			
			if (showErrorBox == true){
				replace_html('#form-errors-message',errorMessage);
				show('#form-errors');
			}
			else{
				hide('#form-errors');
			}
			
			resolve();
		});
	}
	
	
	async function show_hide_elements(){

		return new Promise((resolve) => {

			renderDownloadTile = true;
			for (let i=1;i<=samples;i++){
				var percentOfLibrary = get_value('#percent-of-library-'+i);
				if (!percentOfLibrary){
					renderDownloadTile = false;
				}
			}

			if (showDownloadBox != true){
				renderDownloadTile = false;
			}
			if (renderDownloadTile == true){
				document.getElementById('step-submit-2').disabled = false;
			}
			else{
				document.getElementById('step-submit-2').disabled = true;
			}
			resolve();
			
		});
	}
	
	
	async function create_export_table(){
		
		return new Promise((resolve) => {
			clear_html('#export-table-body');
			
			//Create an array to hold all of the table data so we can create a csv file that the user can save
			var exportData = [];
			var sectionData = {};
			
			//Create a listing of dilutions:
				var sampleId = [];
				var currentMaxWells = fieldData['numberOfWells'][1];
				var arrayValue = 1;			//This just is used to reference the current number of wells in the fieldData['numberOfWells'].  Once the maximum number of wells is reached, we move to the next value in the array
				var timesSampledCalled = 0;
				
				for (let i=0;i<=47;i++){
					timesSampledCalled++;
					sampleId[i] = arrayValue; //fieldData['numberOfWells'][arrayValue];
				
					if (timesSampledCalled == currentMaxWells){
						arrayValue++;
						currentMaxWells = fieldData['numberOfWells'][arrayValue];
						timesSampledCalled = 0;
					}
				}
				
			//First 48
				sectionData['sampleId'] = sampleId;
				sectionData['sourceDeckPosition'] = "A1";
				sectionData['tipEject'] = 0;
				sectionData['sourceHeight'] = 31.5;
				sectionData['sourceSBO'] = 2.5;			//14
				sectionData['targetMixHeight'] = 0;	//19
				sectionData['sourceMixCycles'] = 0;	//21
				sectionData['sourceMixSpeed'] = 0;	//22
				
				//Get Transfer Volume
					var count = 0;
					var dilutionVolume = [];
					for (let i=0;i<=47;i++){
						if (fieldData['diluentPerIntermediate'][i]){
							for (let b=0;b<fieldData['numberOfWells'][i];b++){
								dilutionVolume[count] = fieldData['diluentPerIntermediate'][i];
								count++;
							}
						}
					}
					sectionData['dilutionVolume'] = dilutionVolume;
				//End Get Transfer Volume
				
				//Get Tip Type
					sectionData['tipType'] = [];
					for (let i=0;i<=47;i++){
						if(sectionData['dilutionVolume'][i] > 125){
							sectionData['tipType'][i] = 1250;
						}
						else{
							sectionData['tipType'][i] = 125;
						}
					}
				//Get Tip Type
				
				//Target Mix Volume
					sectionData['sourceMixVolume'] = [];
					for (let i=0;i<=47;i++){
						sectionData['sourceMixVolume'][i] = 0;
					}
				//Target Mix Volume
				
				//Source Well
					//Get the Diluent Per Iintermediate per well:
						var count = 0;
						var diluentPerIntermediate = [];
						sectionData['sourceWell'] = [];
						for (let i=0;i<=47;i++){
							for (let b=0;b<fieldData['numberOfWells'][i];b++){
								diluentPerIntermediate[count] = fieldData['diluentPerIntermediate'][i];
								count++;
							}
						}
					//Source Well
						var currentTotalDiluentVolume = 1500;
						var x = 0;
						var dilutionVolLoc = ["F1", "E1", "D1", "C1", "B1", "A1", "F2", "E2", "D2", "C2", "B2", "A2"];
						for (let i=0;i<=47;i++){
							currentTotalDiluentVolume = currentTotalDiluentVolume - diluentPerIntermediate[i];
							if (currentTotalDiluentVolume <= 0){
								currentTotalDiluentVolume = 1500;
								if (x < 11){
									x = x + 1;
								}
							}
							
							sectionData['sourceWell'][i] = dilutionVolLoc[x];
						}
				
				//Source Well
				
				
				create_export_table_section(exportData,sectionData);
			//End First 48
			
			//Second 48
				sectionData['sourceDeckPosition'] = "C";
				sectionData['tipEject'] = 1;
				sectionData['sourceHeight'] = 22.4;
				sectionData['sourceSBO'] = 1.8;			//14
				sectionData['targetMixHeight'] = 3;	//19
				sectionData['sourceMixCycles'] = 6;	//21
				sectionData['sourceMixSpeed'] = 10;	//22
				
				//Get Transfer Volume
					var count = 0;
					var dilutionVolume = [];
					for (let i=0;i<=47;i++){
						
						if (fieldData['correctedSample'][i]){
							for (let b=0;b<fieldData['numberOfWells'][i];b++){
								dilutionVolume[count] = fieldData['correctedSample'][i];
								count++;
							}
						}
					}
					sectionData['dilutionVolume'] = dilutionVolume;
				//End Get Transfer Volume
				
				//Get Tip Type
					for (let i=0;i<=47;i++){
						sectionData['tipType'][i] = 125;
					}
				//Get Tip Type
				
				//Source Mix Volume
					sectionData['sourceMixVolume'] = [];
					var count = 0;
					for (let i=0;i<=47;i++){
						for (let b=1;b<=fieldData['numberOfWells'][i];b++){
							var sourceMixVolume = (fieldData['samplePerWellDead'][i] - (fieldData['correctedSample'][i] * b)) * .6;	// (W - (X * Z)) *.06		(Sample Per Well + Dead) - (Corrected Sample)
							if (sourceMixVolume > 125){
								sourceMixVolume = 125;
							}
							else if(sourceMixVolume < 5){
								sourceMixVolume = 0;
							}
							
							sectionData['sourceMixVolume'][count] = number_round(sourceMixVolume);	
							count++;
						}	
					}
				//Target Mix Volume
				
				//Source Well
					sectionData['sourceWell'] = [];
					var count = 0;
					for (let i=0;i<=47;i++){
						for (let b=0;b<fieldData['numberOfWells'][i];b++){
							sectionData['sourceWell'][count] = fieldData['sampleLocation'][i];
							count++;
						}
					}
	
				create_export_table_section(exportData,sectionData);
			//End Second 48
						
			resolve();
		});
	}
	
	function create_export_table_section(exportData,sectionData){
	
		var currentTargetWell = ["A","B","C","D","E","F","G"];
		var currentTargetWellKey = 0;
		var currentTargetWellNumber = 1;
			
		for (let i=0;i<=47;i++){
			
			//TODO: Only do this if dilutionVol[i] >=2 (only first pass???)
			
			var outputRow = "";
			
			//Calcs:
			outputRow += "<td>Dilution "+sectionData['sampleId'][i]+"</td>";		//0 (Sample ID) (A_
			outputRow += "<td>"+sectionData['sourceDeckPosition']+"</td>";					//1 (Source Deck Position) (B}
			outputRow += "<td>"+sectionData['sourceWell'][i]+"</td>";												//2 (Source Well (C))				//NEED TO CALCULATE
			outputRow += "<td>B</td>";						//3 (Target Deck Position (D))
			outputRow += "<td>"+currentTargetWell[currentTargetWellKey]+currentTargetWellNumber+"</td>";						//4 (Target Well (E)					//NEED TO CALCULATE
			outputRow += "<td>"+sectionData['dilutionVolume'][i]+"</td>";						//5 (Transfer Volume (F))		//NEED TO CALCULATE
			outputRow += "<td>"+sectionData['tipType'][i]+"</td>";						//6 (Tip Type (G))						//NEED TO CALCULATE
			outputRow += "<td>8</td>";						//7 (Aspiration Speed (H))
			outputRow += "<td>8</td>";						//8 (Dispense Speed (I))
			outputRow += "<td>"+sectionData['sourceMixVolume'][i]+"</td>";						//9 (Source Mix Volume (J))			//NEED TO CALCULATE
			outputRow += "<td>0</td>";						//10 (Target Mix Volume (K))
			outputRow += "<td>N</td>";						//11 (Use LLD (L))
			outputRow += "<td>"+sectionData['tipEject']+"</td>";				//12 (Tip Eject (M))
			outputRow += "<td>"+sectionData['sourceHeight']+"</td>";		//13 (Source Height (N))
			outputRow += "<td>"+sectionData['sourceSBO']+"</td>";			//14 (Source SBO (O))
			outputRow += "<td>N</td>";						//15 (Source Tip Travel (P))
			outputRow += "<td>22.9</td>";					//16 (Target Height (Q))
			outputRow += "<td>2</td>";						//17 (Target SBO (R))
			outputRow += "<td>Y</td>";						//18 (Target Tip Travel (S))
			outputRow += "<td>"+sectionData['targetMixHeight']+"</td>";						//19 (Target Mix Height (T))
			outputRow += "<td>N</td>";						//20 (Target Mix Tip Travel (U))
			outputRow += "<td>"+sectionData['sourceMixCycles']+"</td>";						//21 (SourceMixCycles (V))
			outputRow += "<td>"+sectionData['sourceMixSpeed']+"</td>";						//22 (SourceMixSpeed (W))
			outputRow += "<td>0</td>";						//23 (SourceMixSpeed (X))
			outputRow += "<td>0</td>";						//24 (TargetMixCycles (Y))
			outputRow += "<td>0</td>";						//25 (TargetMixSpeed (Z))
			outputRow += "<td>0</td>";						//26 (TargetMixPause (AA))
			outputRow += "<td>0</td>";						//27 (Source Offset X (AB))
			outputRow += "<td>0</td>";						//28 (SourceOffsetY (AC))
			outputRow += "<td>0</td>";						//29 (SourceOffsetX (AD))
			outputRow += "<td>0</td>";						//30 (TargetOffsetY (AE))
			outputRow += "<td>N</td>";						//31 (TipTouch (AF))
			outputRow += "<td>0</td>";						//32 (TipTouchHeight (AG))
			outputRow += "<td>0</td>";						//33 (TipTouchDistance (AH))
			outputRow += "<td>0</td>";						//34 (AirgapVolume (AI))
			outputRow += "<td>2</td>";						//35 (LLDErrorHandling (AJ))
			outputRow += "<td>0</td>";						//36 (LLDSubmergeDepth(AK))
			append_html('#export-table-body',outputRow);			
			
			currentTargetWellNumber++
			
			if (currentTargetWellNumber > 12){
				currentTargetWellNumber = 1;
				currentTargetWellKey++;
			}
		}
	}
	
	
	function download_csv(e){
		e.preventDefault();
		
		let table = document.getElementById("export-table");
		let rows = table.querySelectorAll("tr");
		let csv = [];

		rows.forEach(row => {
			let cols = row.querySelectorAll("th, td");
			let rowData = [];
			cols.forEach(col => rowData.push('"' + col.innerText.replace(/"/g, '""') + '"')); // Escape quotes
			csv.push(rowData.join(","));
		});

		let csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
		let encodedUri = encodeURI(csvContent);
		let link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "sample-loading-table.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	
	
	function remove_commas(commaString){
		return commaString.replace(/,/g, "")
	}
