<!-- Begin worksheet -->
<div class="worksheet">
	<div class="p-t-50 p-b-100 contain-1300 p-mobile-1350">
		
				<h1 class="p-b-25"><span class="h1-pre">Evercode WT</span> Sample Loading Table</h1>
	
				<div class="sample-loading-worksheet-breadcrumbs">
					<div id="arrow-box-1" class="arrow-box arrow-box-1 current"><div class="worksheet-breadcrumbs-label vertical-center"><i class="saphire-icon saphire-icons-ico-circle-check-solid" aria-hidden="true"></i> Samples &amp; Cells</div></div>
					<div id="arrow-box-2" class="arrow-box arrow-box-2"><div class="worksheet-breadcrumbs-label vertical-center"><i class="saphire-icon saphire-icons-ico-circle-check-solid" aria-hidden="true"></i> Sample Information</div></div>
					<div id="arrow-box-3" class="arrow-box arrow-box-3"><div class="worksheet-breadcrumbs-label vertical-center"><i class="saphire-icon saphire-icons-ico-circle-check-solid" aria-hidden="true"></i> Download Loading Table</div></div>
				</div>
		
			
				<div id="form-errors" class="form-errors" style="display: none;">
					<div class="columns-flex">
						<div class="col col-125 form-errors-icon">
							<img src="<?php echo get_stylesheet_directory_uri(); ?>/inc/images/exclamation-circle.svg" />
						</div>
						<div class="col col-fluid p-25">
							<h2>Warnings</h2>
							<div id="form-errors-message" class="form-errors-message"></div>
						</div>
					</div>
				</div>
		
		
				<div class="columns-flex">
					<div class="col col-375 p-r-15">
						<div class="worksheet-tile">
							<h2>Samples &amp; Cells</h2>
							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
							</p>
							<div class="form-row">
								<div class="form-row-label"><label for="number-of-samples">Number of Samples:</label></div> <input type="text" name="number-of-samples" id="number-of-samples" class="restrict-to-numbers input-width-150" />
							</div>
							<div class="form-row">
								<div class="form-row-label">
									<label for="number-of-barcoded-cells">Target Number of Barcoded Cells:</label>
									<div class="form-row-label-notes">
										The default is 100,000 cells for Evercode WT
									</div>
								</div> 
								<input type="text" name="number-of-barcoded-cells" id="number-of-barcoded-cells" class="restrict-to-numbers input-width-150" value="100000" />
							</div>
							<div class="p-t-5 p-b-5">
								<button type="button" id="step-submit-1" class="btn btn-black btn-black-small" disabled>Next Step</button>
							</div>
						</div>
					</div>
					<div class="col col-500 p-l-15 p-r-15">
						<div id="sample-information-tile" class="worksheet-tile" style="display: none;">
							<h2>Sample Information</h2>
							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Adipiscing elit, sed do eiusmod tempor incididunt ut.
							</p>
							<div class="samples-table-user-input-container">
								<table id="samples-table-user-input fixed-header" class="simple-table">
									<thead>
										<tr>
											<th style="width: 35px;">#</th>
											<th>Sample<br />Name</th>
											<th style="width: 90px;">Percent<br />of Library</th>
											<th style="width: 110px;">Stock<br />Concentration (cells/uL)</th>
										</tr>
									</thead>
									<tbody id="samples-table-user-input-body"></tbody>
									<tfoot>
										<tr>
											<td>&nbsp;</td>
											<td></td>
											<td style="padding-bottom: 10px;"><div id="percent-of-library-total" class="percent-of-library-total text-left"></div></td>
											<td></td>
										</tr>
									</tfoot>
								</table>
							</div>
							<div class="p-t-20">
								<button type="button" id="step-submit-2" class="btn btn-black btn-black-small" disabled>Next Step</button>
							</div>
						</div>
					</div>
					<div class="col col-fluid p-l-15">
						<div id="download-tile" class="worksheet-tile" style="display: none;">
							<h2>Download</h2>
							<p class="p-b-25">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
							</p>
							<a href="" id="download-csv" class="btn btn-gradient"><i class="saphire-icon saphire-icons-ico-download-solid" aria-hidden="true" style="margin-right: 5px;"></i> Download Loading Table CSV</a>
						</div>
					</div>
				</div>

				<div id="worksheet-data" class="p-t-100" style="display: none;">
					
					<h2>Table Data, Volumes, and Plate Configurations</h2><?php
					
					require_once(get_template_directory()."/functions/ergo-include-script.php");
					include_once(get_template_directory()."/zephyr-functions/str-random-alpha-numeric.php");

					ergo_include_script(get_template_directory()."/acf-blocks/text-accordion/text-accordion.min.js"); ?>
					
					<div class="text-accordion closed" data-closeopen="true">
						<div class="text-accordion-title js-text-accordion-title"><i class="saphire-icon saphire-icons-ico-chevron-right caret" aria-hidden="true"></i> Sample Loading Table</div>
						<div class="text-accordion-body" style="display: none;">
							<?php	samples_table(); ?>
						</div>
					</div>
					
					<div class="text-accordion closed" data-closeopen="true">
						<div class="text-accordion-title js-text-accordion-title"><i class="saphire-icon saphire-icons-ico-chevron-right caret" aria-hidden="true"></i> Integra Loading Table</div>
						<div class="text-accordion-body" style="display: none;">
							<?php integra_loading_table(); ?>
						</div>
					</div>
					
					<div class="text-accordion closed" data-closeopen="true">
						<div class="text-accordion-title js-text-accordion-title"><i class="saphire-icon saphire-icons-ico-chevron-right caret" aria-hidden="true"></i> Plate Configuration</div>
						<div class="text-accordion-body" style="display: none;">
							<?php plate_configuration(); ?>
						</div>
					</div>
					
					<div class="text-accordion closed" data-closeopen="true">
						<div class="text-accordion-title js-text-accordion-title"><i class="saphire-icon saphire-icons-ico-chevron-right caret" aria-hidden="true"></i> Diluent Volumes</div>
						<div class="text-accordion-body" style="display: none;">
							<?php diluent_volumes(); ?></div>
					</div>
				
				</div>
		
	</div>
</div><?php




function plate_configuration(){ ?>
	<div class="p-t-75">
		<h2 class="h2-small">Plate Configuration</h2><?php
		
		$plateConfiguration = array('a','b','c','d','e','f','g','h'); ?>
		
		<div id="plate-configuration-wrapper">
			<table class="plate-configuration-table">
				<tr>
					<th>&nbsp;</th><?php
					for ($col=1;$col<13;$col++){ ?>
						<th><?php echo $col; ?></th><?php
					} ?>
				</tr><?php
				for ($row=0;$row<8;$row++){ ?>
					<tr>
						<td class="row-head"><?php echo $plateConfiguration[$row]; ?></td><?php
						for ($col=1;$col<13;$col++){ ?>
							<td id="plate-configuration-cell-<?php echo ($row+1); ?>-<?php echo $col; ?>"><input type="text" id="plate-configuration-<?php echo ($row+1); ?>-<?php echo $col; ?>" style="width: 40px;" /></td><?php
						} ?>
					</tr><?php
				} ?>
			</table>
		</div>
		
		<h2 class="p-t-50 h2-small">Plate Configuration Table</h2>
			<table class="plate-configuration-listing-table">
				<tr>
					<th>Well #</th>
					<th>Sample #</th>
					<th>Number of Wells</th>
					<th>Times Sample Called</th>
				</tr><?php
			
			for ($i=1;$i<49;$i++){ ?>
				<tr>
					<td><?php echo $i; ?></td>
					<td><input type="text" id="plate-configuration-sample-number-<?php echo $i; ?>" /></td>
					<td><input type="text" id="plate-configuration-wells-<?php echo $i; ?>" /></td>
					<td><input type="text" id="plate-configuration-times-sample-called-<?php echo $i; ?>" /></td>
				</tr><?php
			} ?>
			</table>
	</div><?php
}


function loading_table_section($prefix){
	if ($prefix == "A"){ $sectionStartVal = 0; }
	if ($prefix == "B"){ $sectionStartVal = 12; }
	if ($prefix == "C"){ $sectionStartVal = 24; }
	if ($prefix == "D"){ $sectionStartVal = 36; }
	
	for ($i=1;$i<=12;$i++){  ?>
		<tr>
			<td><input id="loading-table-sample-name-<?php echo $sectionStartVal + $i; ?>" class="input-width-100-percent" type="text" /></td>
			<td><?php echo $prefix.$i; ?></td>
			<td><input disabled id="loading-table-sample-needed-dilution-<?php echo $sectionStartVal + $i; ?>" class="input-width-100-percent" type="text"></td>
		</tr><?php
	}
}	


function samples_table(){ ?>
	<div class="table-container">
		<table id="samples-table" class="samples-table">
			<thead>
				<tr>
					<th class="sticky-top-left width-30">#</th>
					<th class="width-125">Sample<br />Name</th>
					<th class="width-125">Percent<br />of Library</th>
					<th class="width-125">Stock<br />Concentration (cells/uL)</th>
					<th class="width-125">Number<br />of Wells</th>
					<th class="width-125">Targeted Number<br />of Barcoded Cells</th>
					<th class="width-125">Required Sample<br />Concentration (cells/uL)</th>
					<th class="width-125">Volume of Sample<br />Stock Dilution (uL)</th>
					<th class="width-125">Number<br />of Wells</th>
					<th class="width-125">Volume of Sample<br />Dilution Buffer (uL)</th>
					<th class="width-125">Sample<br />Number</th>
					<th class="width-125">Number of<br />Sample Wells</th>
					<th class="width-125">Number of<br />Times Sample Called</th>
					<th class="width-125">Sample Per<br />Well + Dead</th>
					<th class="width-125">Sample Per<br />Input Well</th>
					<th class="width-125">Sample Per<br />Intermediate</th>
					<th class="width-125">Diluent Per<br />Intermediate</th>
					<th class="width-125">Total<br />Diluent</th>
					<th class="width-125">Corrected Sample</th>
					<th class="width-125">Loc</th>
				</tr>
			</thead>
			
			<tbody id="samples-table-body"></tbody>
		</table>
	</div><?php
} 


function diluent_volumes(){ 	?>
	<div>
		<div class="table-container">
			<table id="export-table">
				<thead>
					<tr>
						<th class="width-125">Sample ID</th>
						<th class="width-125">Source Deck Position</th>
						<th class="width-125">Source Well</th>
						<th class="width-125">Target Deck Position</th>
						<th class="width-125">Target Well</th>
						<th class="width-125">Transfer Volume</th>
						<th class="width-125">Tip Type</th>
						<th class="width-125">Aspiration Speed</th>
						<th class="width-125">Dispense Speed</th>
						<th class="width-125">Source Mix Volume</th>
						<th class="width-125">Target Mix Volume</th>
						<th class="width-125">UseLLD (Y/N)</th>
						<th class="width-125">Tip Eject</th>
						<th class="width-125">Source Height (mm)</th>
						<th class="width-125">Source SBO (mm)</th>
						<th class="width-125">Source Tip Travel (Y/N)</th>
						<th class="width-125">Target Height (mm)</th>
						<th class="width-125">Target SBO (mm)</th>
						<th class="width-125">Target Tip Travel (Y/N)</th>
						<th class="width-125">Target Mix Height (mm)</th>
						<th class="width-125">Target Mix Tip Travel (Y/N)</th>
						<th class="width-125">Source Mix Cycles</th>
						<th class="width-125">Source Mix Speed</th>
						<th class="width-125">Source Mix Pause</th>
						<th class="width-125">Target Mix Cycles</th>
						<th class="width-125">Target Mix Speed</th>
						<th class="width-125">Target Mix Pause</th>
						<th class="width-125">Source Offset X</th>
						<th class="width-125">Source Offset Y</th>
						<th class="width-125">Target Offset X</th>
						<th class="width-125">Target Offset Y</th>
						<th class="width-125">TipTouch (Y/N)</th>
						<th class="width-125">Tip Touch Height</th>
						<th class="width-125">Tip Touch Distance</th>
						<th class="width-125">Airgap Volume</th>
						<th class="width-125">LLD Error Handling</th>
						<th class="width-125">LLD Submerge Depth</th>
					</tr>
				</thead>
				<tbody id="export-table-body"></tbody>
			</table>
		</div>
	</div><?php
} 


function integra_loading_table(){?>
	<div class="columns-flex">
		<div class="col col-500">
		
			<div id="integra-loading-table-section">
				<table id="samples-table" class="samples-table">
					<thead>
						<tr>
							<th>Sample Name</th>
							<th>Sample Location</th>
							<th>Min Sample Stock Needed for Dilution (uL)</th>
						</tr>
					</thead>
					<tbody><?php
						loading_table_section("A");
						loading_table_section("B");
						loading_table_section("C");
						loading_table_section("D"); ?>
					</tbody>
				</table>
			</div>
		
		</div>
		
		<div class="col col-300 p-t-75 p-l-50">
			<label for="min-diluent-needed">Min Diluent Needed (uL):</label><br />
			<input type="text" id="min-diluent-needed" />
			<br /><br />
			<label for="min-diluent-needed">Required Number of Sample Dilution Tubes:</label><br />
			<input type="text" id="required-number-of-sample-dilution-tubes" />
			<div class="p-t-50"></div>
			<div id="sample-dilution-tube-locations" style="width: 250px;"></div>
		</div>
		
		<div class="col col-fluid p-l-100">
			
		</div>
		
	</div><?php
} ?>
<!-- End worksheet -->