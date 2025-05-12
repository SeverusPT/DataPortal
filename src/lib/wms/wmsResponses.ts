// src/lib/wms/wmsResponses.ts

import { env } from '$env/dynamic/public';

/**
 * Retorna uma Response com o XML de exceção WMS (ServiceExceptionReport).
 * @param code  Ex.: "InvalidParameterValue", "LayerNotDefined", "MissingParameterValue"
 * @param message Mensagem de erro
 * @param status  Código HTTP (400, 404, 500, etc.)
 */
export function wmsException(code: string, message: string, status = 400): Response {
	const errorXML = `
		<ServiceExceptionReport version="1.3.0" 
			xmlns="http://www.opengis.net/ogc">
			<ServiceException code="${code}">
				${message}
			</ServiceException>
		</ServiceExceptionReport>
	`;

	return new Response(errorXML, {
		status,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
}

/**
 * Constrói o XML completo do GetCapabilities WMS 1.3.0,
 * incluindo os <Layer> gerados dinamicamente.
 */
export function buildCapabilitiesXml(layerXmlBlocks: string[]): string {
	return `
		<WMS_Capabilities version="1.3.0" 
			xmlns="http://www.opengis.net/wms"
			xmlns:xlink="http://www.w3.org/1999/xlink">
			
			<Service>
				<Name>WMS</Name>
				<Title>Severidade da Área Ardida (Projeto SeverusPT)</Title>
				<Abstract>Cartografia de severidade das áreas ardidas para Portugal continental baseada em dados de satélite multi-fonte e multi-resolução através do método de comparação de compósitos trimestrais medianos pré- e pós-fogo do índice normalizado de área ardida (INAA; i.e., método delta). Este índice baseia-se no rácio normalizado entre as bandas de imagem do infravermelho-próximo (IVP) e infravermelho-médio (IVM): INAA = (IVP-IVM) / (IVP+IVM). O processamento de imagem é efetuado através da plataforma Google Earth Engine e do software GEE através de bibliotecas especializadas. São usadas séries temporais de imagem ótica de satélite (i.e., no espectro do visível e infravermelho) das missões Landsat, Terra/MODIS e Copernicus/Sentinel-2.</Abstract>
				<OnlineResource xlink:href="${env.PUBLIC_BASE_URL}/products"/>
				<ContactInformation>
					<ContactPersonPrimary>
						<ContactPerson>João F. Gonçalves</ContactPerson>
						<ContactOrganization>BIOPOLIS/CIBIO-InBIO - Universidade do Porto</ContactOrganization>
					</ContactPersonPrimary>
					<ContactAddress>
						<AddressType>Morada</AddressType>
						<Address>Campus Universitário de Vairão, Rua Padre Armando Quintas, 7, 4485-661 Vairão, Vila do Conde</Address>
						<City>Vairão</City>
						<StateOrProvince>Vila do Conde</StateOrProvince>
						<PostCode>4485-661</PostCode>
						<Country>Portugal</Country>
					</ContactAddress>
					<ContactVoiceTelephone>(+351)252660411</ContactVoiceTelephone>
					<ContactElectronicMailAddress>geral@severus.pt</ContactElectronicMailAddress>
				</ContactInformation>
			</Service>

			<Capability>
				<Request>
					<GetCapabilities>
						<Format>application/vnd.ogc.wms_xml</Format>
						<DCPType>
							<HTTP>
								<Get>
									<OnlineResource 
										xmlns:xlink="http://www.w3.org/1999/xlink"
										xlink:href="${env.PUBLIC_BASE_URL}/api/wms?request=GetCapabilities" />
								</Get>
							</HTTP>
						</DCPType>
					</GetCapabilities>

					<GetMap>
						<Format>image/png</Format>
						<Format>image/jpeg</Format>
						<DCPType>
							<HTTP>
								<Get>
									<OnlineResource 
										xmlns:xlink="http://www.opengis.net/wms"
										xlink:href="${env.PUBLIC_BASE_URL}/api/wms?request=GetMap" />
								</Get>
							</HTTP>
						</DCPType>
					</GetMap>

					<GetLegendGraphic>
						<Format>image/png</Format>
						<Format>image/svg+xml</Format>
						<Format>image/jpeg</Format>
						<DCPType>
							<HTTP>
								<Get>
									<OnlineResource 
										xmlns:xlink="http://www.opengis.net/wms"
										xlink:href="${env.PUBLIC_BASE_URL}/api/wms?request=GetLegendGraphic" />
								</Get>
							</HTTP>
						</DCPType>
					</GetLegendGraphic>
				</Request>

				<VendorSpecificCapabilities>
          			<VendorParameter name="lang" default="pt">
            			<Value>pt</Value>
            			<Value>en</Value>
					</VendorParameter>
        		</VendorSpecificCapabilities>

				<Layer>
					<Title>Camadas Disponíveis</Title>
					<Abstract>Conjunto de camadas disponíveis no serviço WMS</Abstract>
					${layerXmlBlocks.join('\n')}
				</Layer>
			</Capability>
		</WMS_Capabilities>
	`.trim();
}
