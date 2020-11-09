#target AfterEffects
var RVReview = (function () {
    {
        this.version = '0.1.0',
        this.name = 'RV Review',
        this.author = 'Gergely Wootsch',
        this.email = 'hello@gergely-wootsch.com'
        this.website = 'http://gergely-wootsch.com'
    }
    
    var tempDir = new Folder ( Folder.temp.fullName + '/RVReview' );
    
    //Resources
    {
        tempDir.create();

        //Folder PNG
        {
            var folderPNG_binary = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00 \x00\x00\x00 \b\x06\x00\x00\x00szz\u00F4\x00\x00\x00\u0098IDATX\u0085\u00ED\u00D0\u00B1\r\u00830\x10\u0085a6\u00C9X\f\x01A\u00A9\u00C9\u0085\x02D\x04\u00DE\u0081\u00C8\u0091\u00BC[6\u00A0\u00BD\u00E85\x16\x1DV\x04\u00BE\x14\u00AF\u00F8\x1B7\u00EF\u00F3\x15\u00AAZXf:\u00FE?\u0080\x10\u00C2\u00E5\u00B5,\u00B7\u00BD\u00DE\u00DE\u0097\u00A7\x00Dd\u00AD\u00EAZS\x02\u00E4p@\u00EA8\x1A\u00C7\u00E7'\u00E5Z{\u00E1\u00EA?\x01\u008E\nW7\x05\u00A0\b\u00B86\u008D\u00CA\u00A3\u00D3\u00BE\x1F\u00B2\u00D4\u00DEE\u00B1\x19\x01xt\u00CEe\r\x1F\u008E\u0080\u00DC\u00E3h\u009Af[\x00\"\u0080\x00\x02\b \u0080\x00\x02\u00B6\x00o\x00\u00F0\x11`\x19\x01\x04|\x01k\u00E2\u00C8\u00A6t\x1C\u009Ct\x00\x00\x00\x00IEND\u00AEB`\u0082"));
            var folderPNG = new File ( tempDir.fullName + '/folder.png' );
            folderPNG.encoding = 'BINARY';
            folderPNG.open('w'); folderPNG.write( folderPNG_binary ); folderPNG.close();
        }
    
        //Redbin PNG
        {
            var redbin_binary = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00 \x00\x00\x00\x18\b\x06\x00\x00\x00\u009BS\u00FF4\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00A\u00F3iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?>\n<x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 5.6-c067 79.157747, 2015/03/30-23:40:42        \">\n   <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">\n      <rdf:Description rdf:about=\"\"\n            xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\"\n            xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n            xmlns:photoshop=\"http://ns.adobe.com/photoshop/1.0/\"\n            xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\"\n            xmlns:stEvt=\"http://ns.adobe.com/xap/1.0/sType/ResourceEvent#\"\n            xmlns:stRef=\"http://ns.adobe.com/xap/1.0/sType/ResourceRef#\"\n            xmlns:tiff=\"http://ns.adobe.com/tiff/1.0/\"\n            xmlns:exif=\"http://ns.adobe.com/exif/1.0/\">\n         <xmp:CreatorTool>Adobe Photoshop CC 2015 (Windows)</xmp:CreatorTool>\n         <xmp:CreateDate>2015-05-25T20:25:14+02:00</xmp:CreateDate>\n         <xmp:ModifyDate>2015-10-24T03:19:58+02:00</xmp:ModifyDate>\n         <xmp:MetadataDate>2015-10-24T03:19:58+02:00</xmp:MetadataDate>\n         <dc:format>image/png</dc:format>\n         <photoshop:ColorMode>3</photoshop:ColorMode>\n         <xmpMM:InstanceID>xmp.iid:219128b6-8218-9242-86e2-02c1c509ad9d</xmpMM:InstanceID>\n         <xmpMM:DocumentID>adobe:docid:photoshop:46e524b0-79ed-11e5-830c-a9c38e600ee3</xmpMM:DocumentID>\n         <xmpMM:OriginalDocumentID>xmp.did:f8517903-d2a1-da4c-9738-56f7a8a1f6b6</xmpMM:OriginalDocumentID>\n         <xmpMM:History>\n            <rdf:Seq>\n               <rdf:li rdf:parseType=\"Resource\">\n                  <stEvt:action>created</stEvt:action>\n                  <stEvt:instanceID>xmp.iid:f8517903-d2a1-da4c-9738-56f7a8a1f6b6</stEvt:instanceID>\n                  <stEvt:when>2015-05-25T20:25:14+02:00</stEvt:when>\n                  <stEvt:softwareAgent>Adobe Photoshop CC 2015 (Windows)</stEvt:softwareAgent>\n               </rdf:li>\n               <rdf:li rdf:parseType=\"Resource\">\n                  <stEvt:action>converted</stEvt:action>\n                  <stEvt:parameters>from image/png to application/vnd.adobe.photoshop</stEvt:parameters>\n               </rdf:li>\n               <rdf:li rdf:parseType=\"Resource\">\n                  <stEvt:action>saved</stEvt:action>\n                  <stEvt:instanceID>xmp.iid:5b388805-7d85-dc4d-ba67-ee06e949f8a6</stEvt:instanceID>\n                  <stEvt:when>2015-10-24T03:13:54+02:00</stEvt:when>\n                  <stEvt:softwareAgent>Adobe Photoshop CC 2015 (Windows)</stEvt:softwareAgent>\n                  <stEvt:changed>/</stEvt:changed>\n               </rdf:li>\n               <rdf:li rdf:parseType=\"Resource\">\n                  <stEvt:action>saved</stEvt:action>\n                  <stEvt:instanceID>xmp.iid:059e78ef-36c1-6848-bc41-e02bc69f5a57</stEvt:instanceID>\n                  <stEvt:when>2015-10-24T03:19:58+02:00</stEvt:when>\n                  <stEvt:softwareAgent>Adobe Photoshop CC 2015 (Windows)</stEvt:softwareAgent>\n                  <stEvt:changed>/</stEvt:changed>\n               </rdf:li>\n               <rdf:li rdf:parseType=\"Resource\">\n                  <stEvt:action>converted</stEvt:action>\n                  <stEvt:parameters>from application/vnd.adobe.photoshop to image/png</stEvt:parameters>\n               </rdf:li>\n               <rdf:li rdf:parseType=\"Resource\">\n                  <stEvt:action>derived</stEvt:action>\n                  <stEvt:parameters>converted from application/vnd.adobe.photoshop to image/png</stEvt:parameters>\n               </rdf:li>\n               <rdf:li rdf:parseType=\"Resource\">\n                  <stEvt:action>saved</stEvt:action>\n                  <stEvt:instanceID>xmp.iid:219128b6-8218-9242-86e2-02c1c509ad9d</stEvt:instanceID>\n                  <stEvt:when>2015-10-24T03:19:58+02:00</stEvt:when>\n                  <stEvt:softwareAgent>Adobe Photoshop CC 2015 (Windows)</stEvt:softwareAgent>\n                  <stEvt:changed>/</stEvt:changed>\n               </rdf:li>\n            </rdf:Seq>\n         </xmpMM:History>\n         <xmpMM:DerivedFrom rdf:parseType=\"Resource\">\n            <stRef:instanceID>xmp.iid:059e78ef-36c1-6848-bc41-e02bc69f5a57</stRef:instanceID>\n            <stRef:documentID>xmp.did:f8517903-d2a1-da4c-9738-56f7a8a1f6b6</stRef:documentID>\n            <stRef:originalDocumentID>xmp.did:f8517903-d2a1-da4c-9738-56f7a8a1f6b6</stRef:originalDocumentID>\n         </xmpMM:DerivedFrom>\n         <tiff:Orientation>1</tiff:Orientation>\n         <tiff:XResolution>720000/10000</tiff:XResolution>\n         <tiff:YResolution>720000/10000</tiff:YResolution>\n         <tiff:ResolutionUnit>2</tiff:ResolutionUnit>\n         <exif:ColorSpace>65535</exif:ColorSpace>\n         <exif:PixelXDimension>32</exif:PixelXDimension>\n         <exif:PixelYDimension>24</exif:PixelYDimension>\n      </rdf:Description>\n   </rdf:RDF>\n</x:xmpmeta>\n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                                                                                                    \n                            \n<?xpacket end=\"w\"?>$\u00B1_\u00F2\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F9\u00FF\x00\x00\u0080\u00E9\x00\x00u0\x00\x00\u00EA`\x00\x00:\u0098\x00\x00\x17o\u0092_\u00C5F\x00\x00\f(IDATx\x01\x00\x18\f\u00E7\u00F3\x01\u00FF\u00FF\u00FF\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x01\x01\u00D9\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00FF\u00FF\u00FF'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00DD$$\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00#\u00DC\u00DC\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00#\u00DC\u00DC\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00DD$$\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00D0\"\"\x00\r\x02\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00F3\u00FE\u00FE\x000\u00DE\u00DE\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\r\x02\x02\x00#\u00DC\u00DC\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00DD$$\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00D0\"\"\x00\r\x02\x02\x00\x00\x00\x00\x00\u00DD$$\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00DD$$\x00\u00F3\u00FE\u00FE\x000\u00DE\u00DE\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\r\x02\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\r\x02\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00#\u00DC\u00DC\x00\u0091\u00EE\u00EE\x00#\u00DC\u00DC\x00\u0091\u00EE\u00EE\x00#\u00DC\u00DC\x00\u0091\u00EE\u00EE\x00#\u00DC\u00DC\x00\u0091\u00EE\u00EE\x00#\u00DC\u00DC\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00o\x12\x12\x00\x00\x00\x00\x00o\x12\x12\x00\x00\x00\x00\x00o\x12\x12\x00\x00\x00\x00\x00o\x12\x12\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00A6\x1B\x1B\x00\x00\x00\x00\x00\u00A6\x1B\x1B\x00\x00\x00\x00\x00\u00A6\x1B\x1B\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00F3\u00FE\u00FE\x007\t\t\x00\x00\x00\x00\x007\t\t\x00\x00\x00\x00\x007\t\t\x00\u00F3\u00FE\u00FE\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x000\u00DE\u00DE\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00DD$$\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\u00FF\u00FF\u00FF\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x01\x01\u00D9\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\u00FF\u00FF\u00FF'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\u00FF\u00FF\u00FF\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x00\x00\u00FF\u00FF%\u00CAJW\u00B4\u0091\x03K\x00\x00\x00\x00IEND\u00AEB`\u0082"))
            var redbinPNG = new File ( tempDir.fullName + '/redbin.png' );
            redbinPNG.encoding = 'BINARY';
            redbinPNG.open('w'); redbinPNG.write( redbin_binary ); redbinPNG.close();
        }    
        
        //ListWindow_PlayIcon
        {
            var ListWindow_PlayIcon_bin = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\f\x00\x00\x00\f\b\x06\x00\x00\x00Vu\\\u00E7\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x03&iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 5.6-c067 79.157747, 2015/03/30-23:40:42        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stRef=\"http://ns.adobe.com/xap/1.0/sType/ResourceRef#\" xmp:CreatorTool=\"Adobe Photoshop CC 2015 (Windows)\" xmpMM:InstanceID=\"xmp.iid:ED65F5578AD311E5B7AA8B644BE1945F\" xmpMM:DocumentID=\"xmp.did:ED65F5588AD311E5B7AA8B644BE1945F\"> <xmpMM:DerivedFrom stRef:instanceID=\"xmp.iid:ED65F5558AD311E5B7AA8B644BE1945F\" stRef:documentID=\"xmp.did:ED65F5568AD311E5B7AA8B644BE1945F\"/> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>\u00B4\x14\u0096q\x00\x00\x00\u009EIDATx\u00DAb\\\u00BE|\u00F9t\x06\x06\u0086\x1A ~\u00CB\u0080\x1F<\x03b\x1E& \u0091\x01\u00C4W\u0080\u00D8\u0081\u0080\x06I \u00E6\x05i\u00F8\x04\u00C4\x12@\u00BC\x1F\u0088\u009B\u00F0h\u00F8\x02\"@\x1A\x18\u0091\x04k\u0081\u00F80\x10k\u00E2\u00D2\u00C5\u0084E\u00CC\x06\u0088/\x03q\x1A\u00B1\x1A@\u0080\x19\u0088g\x02\u00F1i \u0096#F\x03\f(\x001;\u00B1\x1AZ\u0081X\x14\u0088o#\x0B\u00B2`Q\u00F8\b\u0088\u00E3\u0081\u00F8\x00.?\u00FCC\u00E2\u00CF\x03b5\\\u008Aa6\u00F0C\u00D9\u00B1@\u00BC\x04\u008F\x13y`6l\x02b-\x02\u008AA\u00E09\x10\x7F\x06\b0\x00dO\x18\u00DD%\u00A6\x1Br\x00\x00\x00\x00IEND\u00AEB`\u0082"))
            var ListWindow_PlayIcon = new File ( tempDir.fullName + '/ListWindow_PlayIcon.png' );
            ListWindow_PlayIcon.encoding = 'BINARY';
            ListWindow_PlayIcon.open('w'); ListWindow_PlayIcon.write( ListWindow_PlayIcon_bin ); ListWindow_PlayIcon.close();
        }        
        //ListWindow_RevealIcon
        {
            var ListWindow_RevealIcon_bin = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x03&iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 5.6-c067 79.157747, 2015/03/30-23:40:42        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stRef=\"http://ns.adobe.com/xap/1.0/sType/ResourceRef#\" xmp:CreatorTool=\"Adobe Photoshop CC 2015 (Windows)\" xmpMM:InstanceID=\"xmp.iid:BC35DE228ADB11E58D9BDE0A30508B29\" xmpMM:DocumentID=\"xmp.did:BC35DE238ADB11E58D9BDE0A30508B29\"> <xmpMM:DerivedFrom stRef:instanceID=\"xmp.iid:BC35DE208ADB11E58D9BDE0A30508B29\" stRef:documentID=\"xmp.did:BC35DE218ADB11E58D9BDE0A30508B29\"/> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>n\u00F9]\f\x00\x00\x00\u0080IDATx\u00DAb\u00FC\u00FF\u00FF?\x03%\u0080e\u00C5\u008A\x15J@:\x12\u0088y\u0080\x18f\x1A\x13\x10_\x02\u00E2e\x04\r\x00\u00E2\u00D9@\u00EC\u0084E\u00EE\x0F\x10\u00FF\x05\u00E2\u0095\u0084\f0\u00C1#\u00B7\x04\u0088\x0B\u0090\\\x06\x03\u008C@\u00FC\x1D\u0088'\u00B3@m\u00C2g\u0081\x05\x1Eyu&\x06\u00CA\x00\x17\u00A5\x06\u00FC\u00A3\u00D4\x00\u0086Q\x03 \x06\u00B0P\u0092\x15@\x06\u009C\u00A1\u00C0\u00803 \u00DBS\u00B1d&B\x00\u0094\u0094\u00BF\x00\u00F1rFJ\u00B33@\u0080\x01\x00\u00BAP\x19\u00DC\u00FC\u00FAM\x02\x00\x00\x00\x00IEND\u00AEB`\u0082"))
            var ListWindow_RevealIcon = new File ( tempDir.fullName + '/ListWindow_RevealIcon.png' );
            ListWindow_RevealIcon.encoding = 'BINARY';
            ListWindow_RevealIcon.open('w'); ListWindow_RevealIcon.write( ListWindow_RevealIcon_bin ); ListWindow_RevealIcon.close();
        }        
        //ListWindow_RefreshIcon
        {
            var ListWindow_RefreshIcon_bin = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\f\x00\x00\x00\f\b\x06\x00\x00\x00Vu\\\u00E7\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x03&iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 5.6-c067 79.157747, 2015/03/30-23:40:42        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stRef=\"http://ns.adobe.com/xap/1.0/sType/ResourceRef#\" xmp:CreatorTool=\"Adobe Photoshop CC 2015 (Windows)\" xmpMM:InstanceID=\"xmp.iid:36DFB3F08AD511E5AC40AB049F248E31\" xmpMM:DocumentID=\"xmp.did:36DFB3F18AD511E5AC40AB049F248E31\"> <xmpMM:DerivedFrom stRef:instanceID=\"xmp.iid:36DFB3EE8AD511E5AC40AB049F248E31\" stRef:documentID=\"xmp.did:36DFB3EF8AD511E5AC40AB049F248E31\"/> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>3\u0089z\u00F9\x00\x00\x00\u00F2IDATx\u00DA\u0084\u00D11j\x02A\x14\u00C6\u00F1Yw\u00B4\u00F2\x14\u00B9\u0080\u0085\u0085\u0088\x16)$\u0085\u00CD\x06E\u0090\u0090X\u00A6\u0088G\u00F0\x00\u00E9\x04I\x157\u0084-\u0084\x05\x1Bme\x11\u009B\x1C\u00C2&]\u008A\u0090TI\u00B9\x11\u0093\u00FF\u0083\x17\x187\u008By\u00F0ca\u00E6\u00ED\u00CC73^\x1C\u00C7F\u00AB\u0080K\fP\u0085\u008F-\x1E\x10\u00E2\x1B7V\u009BK\u0098#\u00C0;\x12\u00ECP\u00C3=z\u0098abuein\u00E1\x1A\x11\u00BEt!\x0FW\u00BA\u008B\u00CC\x1B\u00AB1\x02m\x0E\u00CDaI\u008C2\u008An\u00EE\u0081\u00C6\u0088\u00CC\u00DF\u00EAH\fw\u00C0\u00EA\x01\x13'\u0086;';\\d\x07}=`\u00B6dlarV\u00D9\u00EAm\u00FCW\x12/\u00953<\u00E2\x04\u00FD#\u00CD\u00A7z\u0093\x15\u00F9a\u008A'\u00BD\u00EF\u00B3\u009C\u00E6&\u0096x\u00C1\u009DD\u00DA\u00A3\u008B5V\u00D8\u00E87E\x1D\u00E7xE\x1B\u009F\u00BF/\u00FD\u0086\x06\u0086\u00FA&#=\u00DF3n1\u00C6\u00874\u00FE\b0\x00\u00A4\\2||\u0084\u00BB\u00E9\x00\x00\x00\x00IEND\u00AEB`\u0082"))
            var ListWindow_RefreshIcon = new File ( tempDir.fullName + '/ListWindow_RefreshIcon.png' );
            ListWindow_RefreshIcon.encoding = 'BINARY';
            ListWindow_RefreshIcon.open('w'); ListWindow_RefreshIcon.write( ListWindow_RefreshIcon_bin ); ListWindow_RefreshIcon.close();
        }       
        //ListWindow_FilesIcon
        {
            var ListWindow_FilesIcon_bin = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x03&iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 5.6-c067 79.157747, 2015/03/30-23:40:42        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stRef=\"http://ns.adobe.com/xap/1.0/sType/ResourceRef#\" xmp:CreatorTool=\"Adobe Photoshop CC 2015 (Windows)\" xmpMM:InstanceID=\"xmp.iid:DC490A088AD811E5BBDDBB469F5FAB33\" xmpMM:DocumentID=\"xmp.did:DC490A098AD811E5BBDDBB469F5FAB33\"> <xmpMM:DerivedFrom stRef:instanceID=\"xmp.iid:DC490A068AD811E5BBDDBB469F5FAB33\" stRef:documentID=\"xmp.did:DC490A078AD811E5BBDDBB469F5FAB33\"/> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>P\u00FF\x0B\x06\x00\x00\x00\u00E5IDATx\u00DAb\u00FC\u00FF\u00FF?\u00C3\u008A\x15+\u008A\x19\x18\x18\u00AA\u0080\u0098\u009F\x01?\u00F0\x06\u00E2\u009D0NDD\x04\x03\x0B\u0094]\n\u00C4\u00F7\u0081x\r\x10\u00FF\x07\u00E2\u00DFP\x1A\x190\x01\u00F1et\x13a\x06\u00B0\x02\u00F1\x01 \u00EE\u0080\u00F2\x05\u0080\u0098\r\u008B!\u00DC@\u00AC\n\u00C4?\u0081\u00F8\x11\u00B2\x01\u00FF\u00A0\u0086\u0080\u00C0t NA\u0092\u00C3\x06~\x01q\x0F\x10W#+\u00FA\x0Buf*\x10o\x06\u00E2\u008DP>:\x00Y\u0096\x00UW\u008Dn\x0B#T\u00D3a ^\u0080\u00C7\x05\u00BAP\u008C\u00D3\x06v\x02\u00B1\u00C1\x06U\u0087\u00D5\x00\u0092\u00C0\u00E01\u0080\x17\u00889\u00B0\u00C4;A\x00\u008B\u00859@|\u0094\u0088\u00C0\u00C3i@\x0E\u0094\x16\u00A6F\x18\u0080\u00C4~\x10\u00D0\u00F7\x13\u00A6\x17=!\u00FD\u0081b\x1F\u00A8w\x18\u00B1h\x06\u0085\u0093\x034\u00C3a\x18\u00F0\t\u0088\u00BB\u00808\x17\u0088\u00ED\u00F1\u00B8\u00E0#\x10\u00B7\u0081\x18\x00\x01\x06\x00\u00D2\u009B,SW\u00E3\x0E\"\x00\x00\x00\x00IEND\u00AEB`\u0082"))
            var ListWindow_FilesIcon = new File ( tempDir.fullName + '/ListWindow_FilesIcon.png' );
            ListWindow_FilesIcon.encoding = 'BINARY';
            ListWindow_FilesIcon.open('w'); ListWindow_FilesIcon.write( ListWindow_FilesIcon_bin ); ListWindow_FilesIcon.close();
        }       
        //ListWindow_SettingsIcon
        {
            var ListWindow_SettingsIcon_bin = (new String("\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x0E\x00\x00\x00\x0E\b\x06\x00\x00\x00\x1FH-\u00D1\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x03&iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 5.6-c067 79.157747, 2015/03/30-23:40:42        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stRef=\"http://ns.adobe.com/xap/1.0/sType/ResourceRef#\" xmp:CreatorTool=\"Adobe Photoshop CC 2015 (Windows)\" xmpMM:InstanceID=\"xmp.iid:6BD50B698ADC11E5807090C6CFD60E0C\" xmpMM:DocumentID=\"xmp.did:6BD50B6A8ADC11E5807090C6CFD60E0C\"> <xmpMM:DerivedFrom stRef:instanceID=\"xmp.iid:6BD50B678ADC11E5807090C6CFD60E0C\" stRef:documentID=\"xmp.did:6BD50B688ADC11E5807090C6CFD60E0C\"/> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>\u00AE\u00F9(\u0082\x00\x00\x01\x12IDATx\u00DAb\\\u00BE|9\x03\x16\u00B0\t\u0088\x1D\u00A0\u00EC5@\u009C\u0084\u00AE\u0080\u0085\x01;0\x01b^(\u00DB\x12\u009B\x02&(\x1D\n\u00C4\x0B\u0080X\x1D\u0088\x13\u0081X\x04I\u008D\x1A\x10\u00A7\x01\u00B16\x10\u00CF\u0084\u00D9\u00CE\bt*\x0F\u0090~\n\u00C4|\f\u00C4\x03\x05&\u00A8\x1F\u00B0i\u00BA\x00\u00C4\u00A7ph\u00DC\f\u00D2\u00B8\x05\u0088\u00BF\u00A0I\u00F8\x03\u00B1!\x10\u009B\x03\u00B1\x1B\x10\u00FFG\u0092\u00FB\x07\u00F2\x16H\u00E3\x14\u00A8\u00BF`\u00E0\x004Ta`7\x10\u00CFE\u00E2\x07\x03q\x1F,p.\"I\u00BC\u00C2\u00E2\u00B4\u00C7H\u00EC\u00F3\u00B0Pu\x04\u00E2YH\x12>@\u00AC\u0082\u00C4\u0097\x04\u00E2\f$\u00FE6 \u008E\x05\u00C5c\x07\x10\u009B!IpA]\u00D0\x0B\u00C4\u00DF\u0081\u00B8\b-z\u00B4\u0080x\x11Hc\f\x10_\x02b\x0E4\u00CD\u00B5x\u00A2#\x12\u00E4\u00D4\u00DB@\u00DC\x03\u00C4\u00CF\u0081\u00B8\x10\u00CD\u00D90p\x06\u0088\u008B\u0081\u00F8:\x10\u00EF\x02\u00E2\x15\u008C\u00D0\u00B4\u00CA\x04M~\u00BF\u00A0\n\u009FA\u00FD\u0086\u009C4\u00FFbKr\u00FF\u00904\u0081\u00C0\t \u00FE\f\u00C5\u0087\u00D15\u0081\x00@\u0080\x01\x00S\u00B06\u00CC+\u008E@\u00E8\x00\x00\x00\x00IEND\u00AEB`\u0082"))
            var ListWindow_SettingsIcon = new File ( tempDir.fullName + '/ListWindow_SettingsIcon.png' );
            ListWindow_SettingsIcon.encoding = 'BINARY';
            ListWindow_SettingsIcon.open('w'); ListWindow_SettingsIcon.write( ListWindow_SettingsIcon_bin ); ListWindow_SettingsIcon.close();
        }
    }

    //RVReview Settings
    var SettingsWindow = (function (thisObj) {
    
    {
        var settings = {};
        settings.sectionName = 'RVReview';
        settings.player = 'rv';
        
        settings.rv = {};
        settings.rv.rv_help = (new String("-c\r\n                Use region frame cache\r\n-l\r\n                Use look-ahead cache\r\n-nc\r\n                Use no caching\r\n-s float\r\n                Image scale reduction\r\n-stereo string\r\n                Stereo mode (hardware, checker, scanline, anaglyph, left, right, pair, mirror, hsqueezed, vsqueezed)\r\n-vsync int\r\n                Video Sync (1 = on, 0 = off, default = 0)\r\n-comp string\r\n                Composite mode (over, add, difference, replace, default=replace)\r\n-layout string\r\n                Layout mode (packed, row, column, manual)\r\n-over\r\n                Same as -comp over -view defaultStack\r\n-diff\r\n                Same as -comp difference -view defaultStack\r\n-tile\r\n                Same as -comp tile -view defaultStack\r\n-wipe\r\n                Same as -over with wipes enabled\r\n-view string\r\n                Start with a particular view\r\n-noSequence\r\n                Don't contract files into sequences\r\n-inferSequence\r\n                Infer sequences from one file\r\n-autoRetime int\r\n                Automatically retime conflicting media fps in sequences and stacks (1 = on, 0 = off, default = 1)\r\n-rthreads int\r\n                Number of reader threads (default = 1)\r\n-renderer string\r\n                Default renderer type (Composite or Direct)\r\n-fullscreen\r\n                Start in fullscreen mode\r\n-present\r\n                Start in presentation mode (using presentation device)\r\n-presentAudio int\r\n                Use presentation audio device in presentation mode (1 = on, 0 = off)\r\n-presentDevice string\r\n                Presentation mode device\r\n-presentVideoFormat string\r\n                Presentation mode override video format (device specific)\r\n-presentDataFormat string\r\n                Presentation mode override data format (device specific)\r\n-screen int\r\n                Start on screen (0, 1, 2, ...)\r\n-noBorders\r\n                No window manager decorations\r\n-geometry int int [ int int ]\r\n                Start geometry x, y, w, h\r\n-init string\r\n                Override init script\r\n-nofloat\r\n                Turn off floating point by default\r\n-maxbits int\r\n                Maximum default bit depth (default=32)\r\n-gamma float\r\n                Set display gamma (default=1)\r\n-sRGB\r\n                Display using linear -> sRGB conversion\r\n-rec709\r\n                Display using linear -> Rec 709 conversion\r\n-floatLUT int\r\n                Use floating point LUTs (requires hardware support, 1=yes, 0=no, default=platform-dependant)\r\n-dlut string\r\n                Apply display LUT\r\n-brightness float\r\n                Set display relative brightness in stops (default=0)\r\n-resampleMethod string\r\n                Resampling method (area, linear, cube, nearest, default=area)\r\n-eval string\r\n                Evaluate expression at every session start\r\n-nomb\r\n                Hide menu bar on start up\r\n-play\r\n                Play on startup\r\n-fps float\r\n                Overall FPS\r\n-cli\r\n                Mu command line interface\r\n-vram float\r\n                VRAM usage limit in Mb, default = 64.000000\r\n-cram float\r\n                Max region cache RAM usage in Gb\r\n-lram float\r\n                Max look-ahead cache RAM usage in Gb\r\n-noPBO\r\n                Prevent use of GL PBOs for pixel transfer\r\n-prefetch\r\n                Prefetch images for rendering\r\n-bwait float\r\n                Max buffer wait time in cached seconds, default 5.0\r\n-lookback float\r\n                Percentage of the lookahead cache reserved for frames behind the playhead, default 25\r\n-yuv\r\n                Assume YUV hardware conversion\r\n-volume float\r\n                Overall audio volume\r\n-noaudio\r\n                Turn off audio\r\n-audiofs int\r\n                Use fixed audio frame size (results are hardware dependant ... try 512)\r\n-audioCachePacket int\r\n                Audio cache packet size in samples (default=512)\r\n-audioMinCache float\r\n                Audio cache min size in seconds (default=0.300000)\r\n-audioMaxCache float\r\n                Audio cache max size in seconds (default=0.600000)\r\n-audioModule string\r\n                Use specific audio module\r\n-audioDevice int\r\n                Use specific audio device (default=-1)\r\n-audioRate float\r\n                Use specific output audio rate (default=ask hardware)\r\n-audioPrecision int\r\n                Use specific output audio precision (default=16)\r\n-audioNice int\r\n                Close audio device when not playing (may cause problems on some hardware) default=0\r\n-audioNoLock int\r\n                Do not use hardware audio/video syncronization (use software instead default=0)\r\n-audioGlobalOffset int\r\n                Global audio offset in seconds\r\n-bg string\r\n                Background pattern (default=black, grey18, grey50, checker, crosshatch)\r\n-formats\r\n                Show all supported image and movie formats\r\n-cmsTypes\r\n                Show all available Color Management Systems\r\n-debug string\r\n                Debug category\r\n-cinalt\r\n                Use alternate Cineon/DPX readers\r\n-exrcpus int\r\n                EXR thread count (default=2)\r\n-exrRGBA\r\n                EXR use basic RGBA interface (default=false)\r\n-exrInherit\r\n                EXR guesses channel inheritance (default=false)\r\n-exrIOMethod int [int]\r\n                EXR I/O Method (0=standard, 1=buffered, 2=unbuffered, 3=MemoryMap, 4=AsyncBuffered, 5=AsyncUnbuffered, default=0) and optional chunk size (default=61440)\r\n-jpegRGBA\r\n                Make JPEG four channel RGBA on read (default=no, use RGB or YUV)\r\n-jpegIOMethod int [int]\r\n                JPEG I/O Method (0=standard, 1=buffered, 2=unbuffered, 3=MemoryMap, 4=AsyncBuffered, 5=AsyncUnbuffered, default=0) and optional chunk size (default=61440)\r\n-cinpixel string\r\n                Cineon/DPX pixel storage (default=RGB8_PLANAR)\r\n-cinchroma\r\n                Cineon pixel storage (default=RGB8_PLANAR)\r\n-cinIOMethod int [int]\r\n                Cineon I/O Method (0=standard, 1=buffered, 2=unbuffered, 3=MemoryMap, 4=AsyncBuffered, 5=AsyncUnbuffered, default=3) and optional chunk size (default=61440)\r\n-dpxpixel string\r\n                DPX pixel storage (default=RGB8_PLANAR)\r\n-dpxchroma\r\n                Use DPX chromaticity values (for default reader only)\r\n-dpxIOMethod int [int]\r\n                DPX I/O Method (0=standard, 1=buffered, 2=unbuffered, 3=MemoryMap, 4=AsyncBuffered, 5=AsyncUnbuffered, default=3) and optional chunk size (default=61440)\r\n-tgaIOMethod int [int]\r\n                TARGA I/O Method (0=standard, 1=buffered, 2=unbuffered, 3=MemoryMap, 4=AsyncBuffered, 5=AsyncUnbuffered, default=2) and optional chunk size (default=61440)\r\n-tiffIOMethod int [int]\r\n                TIFF I/O Method (0=standard, 1=buffered, 2=unbuffered, 3=MemoryMap, 4=AsyncBuffered, 5=AsyncUnbuffered, default=2) and optional chunk size (default=61440)\r\n-lic string\r\n                Use specific license file\r\n-noPrefs\r\n                Ignore preferences\r\n-resetPrefs\r\n                Reset preferences to default values\r\n-qtcss string\r\n                Use QT style sheet for UI\r\n-qtstyle string\r\n                Use QT style, default=\"\"\r\n-qtdesktop\r\n                QT desktop aware, default=1 (on)\r\n-xl\r\n                Aggressively absorb screen space for large media\r\n-mouse int\r\n                Force tablet/stylus events to be treated as a mouse events, default=0 (off)\r\n-network\r\n                Start networking\r\n-networkPort int\r\n                Port for networking\r\n-networkHost string\r\n                Alternate host/address for incoming connections\r\n-networkConnect string [int]\r\n                Start networking and connect to host at port\r\n-networkPerm int\r\n                Default network connection permission (0=Ask, 1=Allow, 2=Deny, default=0)\r\n-reuse int\r\n                Try to re-use the current session for incoming URLs (1 = reuse session, 0 = new session, default = 1; OS X only)\r\n-nopackages\r\n                Don't load any packages at startup (for debugging)\r\n-encodeURL\r\n                Encode the command line as an rvlink URL, print, and exit\r\n-bakeURL\r\n                Fully bake the command line as an rvlink URL, print, and exit\r\n-flags string\r\n                Arbitrary flags (flag, or 'name=value') for use in Mu code\r\n-strictlicense\r\n                Exit rather than consume an rv license if no rvsolo licenses are available\r\n-prefsPath string\r\n                Alternate path to preferences directory\r\n-registerHandler\r\n                Register this executable as the default rvlink protocol handler (OS X only)\r\n-scheduler string\r\n                Thread scheduling policy (may require root, linux only)\r\n-priorities int int\r\n                Set display and audio thread priorities (may require root, linux only)\r\n-version\r\n                Show RV version number\r\n                \r\n                \r\n-pa float\r\n                Set the Pixel Aspec Ratio\r\n-ro int\r\n                Shifts first and last frames in the source range (range offset)\r\n-rs int\r\n                Sets first frame number to argument and offsets the last frame number\r\n-fps float\r\n                FPS override\r\n-ao float\r\n                Audio Offset. Shifts audio in seconds (audio offset)\r\n-so float\r\n                Set the Stereo Eye Relative Offset\r\n-volume float\r\n                Audio volume override (default = 1)\r\n-flut filename\r\n                Associate a file LUT with the source\r\n-llut filename\r\n                Associate a look LUT with the source\r\n-pclut filename\r\n                Associate a pre-cache software LUT with the source\r\n-cmap channels\r\n                Remap color channesl for this source (channel names separated by commas)\r\n-select selectType selectName\r\n                Restrict loaded channels to a single view/layer/channel. selectType must be one of view, layer, or channel. selectName is a comma-separated list of view name, layer name, channel name.\r\n-crop x0 y0 x1 y1\r\n                Crop image to box (all integer arguments)\r\n-uncrop width height x y\r\n                Inset image into larger virtual image (all integer arguments)\r\n-in int\r\n                Cut-in frame for this source in default EDL\r\n-out int\r\n                Cut-out frame for this source in default EDL\r\n-noMovieAudio\r\n                Disable source movie's baked-in audio (aka \u00E2\u0080\u009C-nma\u00E2\u0080\u009D)"))
        settings.rv.rv_bin = null;
        settings.rv.rvpush_bin = null;
        settings.rv.rv_call = null;
        settings.rv.rvpush_call = null;
        
        settings.djv = {};
        settings.djv.djv_bin = null;
        settings.djv.djv_call = null;
        settings.aerender = {};
        settings.aerender.aerender_bin = null;
        settings.aerender.aerender_serverroot = null;
        settings.aerender.instances = null;
        settings.aerender.dialog = null;
        
    }
    
    // Window Definition
    {
        var palette = thisObj instanceof Panel ? thisObj : new Window( 'palette', 'Settings', undefined, {
                resizeable:false
            });
        if (palette == null) return;
        palette.margins = 20
        palette.spacing = 20;
    }
    //  Events
    {
        function pickRVButton_onClick() {
            var file = new File('/');
            file = file.openDlg('Where is  \'rv.exe\' located?','Windows exe files:*.exe');
            
            settings.rv.rv_bin = file.fsName;
            set( 'rv_bin', settings.rv.rv_bin );
            
            cls.setstring( 'rvPickString', 'File Set: \'' + get( 'rv_bin' ) + '\'' );
            
        };
        function pickRVPushButton_onClick() {
            var file = new File('/');
            file = file.openDlg('Where is \'rvpush.exe\' located?','Windows exe files:*.exe');
            
            settings.rv.rvpush_bin = file.fsName;
            set( 'rvpush_bin', settings.rv.rvpush_bin );
            
            cls.setstring( 'rvpushPickString', 'File Set: \'' + get( 'rvpush_bin' ) + '\'' );
        };
        function pickDJVPushButton_onClick(){
            alert('pickDJVPushButton_onClick');
        };
        function rvCheckbox_onClick(){
            
            //UI
            palette.findElement('djvPanel').enabled = !this.value;
            palette.findElement('rvPanel').enabled = this.value;
            palette.findElement('djvCheckbox').value = !this.value;
            
            //Internal
            if (this.value){
                settings.player = 'rv'
            } else {
                settings.player = 'djv'
            }
            
            //Set
            app.settings.saveSetting( settings.sectionName, 'player', settings.player )
            
        }
        function djvCheckbox_onClick(){
            
            //UI
            palette.findElement('rvPanel').enabled = !this.value;
            palette.findElement('djvPanel').enabled = this.value;
            palette.findElement('rvCheckbox').value = !this.value;
            
            //Internal
            if (this.value){
                settings.player = 'djv'
            } else {
                settings.player = 'rv'
            }
            
            //Set
            app.settings.saveSetting( settings.sectionName, 'player', settings.player )
        }
        function rvHelpButton_onClick(){
            function alert_scroll (title, input){
               var w = new Window ("dialog", title);
               var list = w.add ("edittext", undefined, input, {multiline: true, scrolling: true});
               list.maximumSize.height = w.maximumSize.height-100;
               list.minimumSize.width = 550;
               w.add ("button", undefined, "Close", {name: "ok"});
               list.size = [500,500];
               w.show ();
            }
            alert_scroll('Help: RV Command Line Switches', settings.rv.rv_help);
        }
        function rvCallString_onChanged(){
            settings.rv.rv_call = this.text;
            app.settings.saveSetting( settings.sectionName, 'rv_call', settings.rv.rv_call )
        }
    }
    // UI
    {
        //Header
        {
            
        }
        
        var binGroup = palette.add('group',undefined,{
                name: 'binGroup'
            });
            binGroup.orientation = 'column';
            
        //RV
        {
            var rvPanel = binGroup.add('panel',undefined,'RV', {
                borderStyle: 'gray',
                name: 'rvPanel'
            });
            rvPanel.alignChildren = ['fill','fill'];
            rvPanel.spacing = 10;
            rvPanel.margins = 20;

            {
                var rvCheckboxGroup = rvPanel.add('group',undefined,{
                    name: 'rvCheckboxGroup'
                });
                var rvCheckbox = rvCheckboxGroup.add('checkbox',undefined,'Use RV for Playback',{
                    name: 'rvCheckbox'
                });
                rvCheckbox.onClick = rvCheckbox_onClick;
            }

            {
                var rvCallStringGroup = rvPanel.add('group',undefined,{
                    name: 'rvCallStringGroup'
                });
                rvCallStringGroup.orientation = 'row';

                var rvCallStringHeader = rvCallStringGroup.add('statictext',undefined,'RV Custom Switches:',{
                    name: 'rvCallStringHeader'
                });
                rvCallStringHeader.size = [150,25];
                
                var rvCallString = rvCallStringGroup.add('edittext',undefined,'',{
                   name: 'rvCallString'                                      
                });
                rvCallString.size = [290,25];
                rvCallString.onChange = rvCallString.onChanged = rvCallString_onChanged

                var rvHelpButton = rvCallStringGroup.add('button',undefined,'RV Help',{
                    name: 'rvHelpButton'
                });
                rvHelpButton.size = [150,25];
                rvHelpButton.onClick = rvHelpButton_onClick;
            }

            {
                var rvGroup = rvPanel.add('group',undefined,{
                    name: 'rvGroup'
                });
                rvGroup.orientation = 'row';

                var pickRVButton = rvGroup.add('button',undefined,'Set RV Path',{
                    name: 'pickRVButton'
                });
                pickRVButton.size = [150,25];
                pickRVButton.onClick = pickRVButton_onClick;
                
                var rvPickString = rvGroup.add('statictext',undefined,'path not set',{
                    name: 'rvPickString'
                });
                rvPickString.enabled = false;
                rvPickString.graphics.foregroundColor = rvPickString.graphics.newPen (palette.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                rvPickString.alignment = 'right';
                rvPickString.size = [450,25];
            }

            {
                var rvpushCallStringGroup = rvPanel.add('group',undefined,{
                    name: 'rvpushCallStringGroup'
                });
                rvpushCallStringGroup.orientation = 'row';

                var rvpushCallStringHeader = rvpushCallStringGroup.add('statictext',undefined,'RVPush Custom Switches:',{
                    name: 'rvpushCallStringHeader'
                });
                rvpushCallStringHeader.size = [150,25];

                var rvpushCallString = rvpushCallStringGroup.add('edittext',undefined,'',{
                   name: 'rvpushCallString'                                      
                });
                rvpushCallString.size = [260,25];
            }
            
            {
                var rvpushGroup = rvPanel.add('group',undefined,{
                    name: 'rvpushGroup'
                });
                rvpushGroup.orientation = 'row';
                var pickRVPushButton = rvpushGroup.add('button',undefined,'Set RVPush Path',{
                    name: 'pickRVPushButton'
                 });
                pickRVPushButton.size = [150,25];
                pickRVPushButton.onClick = pickRVPushButton_onClick;
                
                var rvpushPickString = rvpushGroup.add('statictext',undefined,'path not set',{
                    name: 'rvpushPickString'
                });
                rvpushPickString.enabled = false;
                rvpushPickString.graphics.foregroundColor = rvpushPickString.graphics.newPen (palette.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                rvpushPickString.alignment = 'right';
                rvpushPickString.size = [450,25];
            }
        }

        //DJV
        {
            var djvPanel = binGroup.add('panel',undefined,'DJV', {
                borderStyle: 'gray',
                name: 'djvPanel'
            });
            djvPanel.alignChildren = ['fill','fill'];
            djvPanel.spacing = 10;
            djvPanel.margins = 20;


            {
                var djvCheckboxGroup = djvPanel.add('group',undefined,{
                    name: 'djvCheckboxGroup'
                });
                var djvCheckbox = djvCheckboxGroup.add('checkbox',undefined,'Use DJV for Playback',{
                    name: 'djvCheckbox'
                });
                djvCheckbox.onClick = djvCheckbox_onClick
            }

            {
                var djvCallStringGroup = djvPanel.add('group',undefined,{
                    name: 'djvCallStringGroup'
                });
                djvCallStringGroup.orientation = 'row';
                djvCallStringGroup.alignChildren = ['fill','fill'];
                var djvCallString = djvCallStringGroup.add('edittext',undefined,'',{
                   name: 'djvCallString'                                      
                });
            }

            {
                var djvGroup = djvPanel.add('group',undefined,{
                    name: 'djvGroup'
                });
                djvGroup.orientation = 'row';
                var pickDJVButton = djvGroup.add('button',undefined,'Set DJV Path',{
                    name: 'pickDJVButton'
                 });
                pickDJVButton.size = [150,25];
                pickDJVButton.onClick = pickDJVPushButton_onClick;
                var djvPickString = djvGroup.add('statictext',undefined,'djv path not yet set',{
                    name: 'djvPickString'
                });
                djvPickString.graphics.foregroundColor = djvPickString.graphics.newPen (palette.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                djvPickString.alignment = 'right';
                djvPickString.size = [450,25];
            }
        }
        
        //Footer
        {
            var closeBtn = palette.add ("button", undefined, "Close", {name: "ok"});
            closeBtn.onClick = function () {
                palette.hide();
            }
        }
        
    }

    // Internals
    {
        var set = function ( keyName, value ) {
            var s = app.settings;
            s.saveSetting( settings.sectionName, keyName, value )
            return s.getSetting( settings.sectionName, keyName )
        }
        var get = function ( keyName ) {
            var s = app.settings;
            if ( s.haveSetting( settings.sectionName, keyName ) ) {
                return s.getSetting( settings.sectionName, keyName )   
            } else {
                return null
            }
        }
    }
        
    // Settings    
    {
        settings.init = (function (){
            
            settings.player = get( 'player' );
            settings.rv.rv_bin = get( 'rv_bin' );
            settings.rv.rvpush_bin = get( 'rvpush_bin' );
            settings.rv.rv_call = get( 'rv_call' );
            settings.rv.rvpush_call = get( 'rvpush_call' );
            
            settings.djv.djv_bin = get( 'djv_bin' );
            settings.djv.djv_call = get ( 'djv_call' );
            
            settings.aerender.aerender_bin = get ( 'aerender_bin' );
            settings.aerender.aerender_serverroot = get ( 'aerender_serverroot' );
            settings.aerender.aerender_instances = get ( 'aerender_instances' );
            settings.aerender.aerender_dialog = get ( 'aerender_dialog' );

        }());
    }
    
    var cls = function () {
        this.show = function() {
            //Set UI According to Settings
            
            // settings.player
            {
                if ( settings.player == 'rv' ) {
                    palette.findElement('djvPanel').enabled = false;
                    palette.findElement('rvPanel').enabled = true;
                    palette.findElement('rvCheckbox').value = true;
                    palette.findElement('djvCheckbox').value = false;
                }
                if ( settings.player == 'djv' ) {
                    palette.findElement('djvPanel').enabled = true;
                    palette.findElement('rvPanel').enabled = false;
                    palette.findElement('rvCheckbox').value = false;
                    palette.findElement('djvCheckbox').value = true;
                }
            }
            
            // settings.rv.rv_bin
            {
                if ( !get( 'rv_bin' ) ) {
                    cls.setstring( 'rvPickString', 'Path not set.' );
                } else {
                    cls.setstring( 'rvPickString', '\'' + get( 'rv_bin' ) + '\'' );
                }
            }
            // settings.rv.rvpush_bin
            {
                if ( !get( 'rvpush_bin' ) ) {
                    cls.setstring( 'rvpushPickString', 'Path not set.' );
                } else {
                    cls.setstring( 'rvpushPickString', '\'' + get( 'rvpush_bin' ) + '\'' );
                }
            }
            // settings.rv.rv_call
            {
                if ( !get( 'rv_call' ) ) {
                    cls.setstring( 'rvCallString', '' );
                } else {
                    cls.setstring( 'rvCallString', get( 'rv_call' ) );
                }
            }
            // settings.djv.djv_bin
            {
                if ( !get( 'djv_bin' ) ) {
                    cls.setstring( 'djvPickString', 'Path not set.' );
                } else {
                    cls.setstring( 'djvPickString', '\'' + get( 'djv_bin' ) + '\'' );
                }
            }
            
            palette.layout.layout(true);
            palette.layout.resize();
            if (!(palette instanceof Panel)) palette.show();
        };
        this.setSetting = function( inKeyValue, inValue ){
            app.settings.setSetting( sectionName)
        };
        this.getSetting = function( inKeyValue ){
            return get( inKeyValue )
        };
        this.haveSettings = function( inKeyValue ){
            var value = app.settings.haveSettings( sectionName, inKeyValue );
            return value;
        };
        this.aerender_bin = (function (){
            var version = parseFloat( app.version ),
                binpath,
                file;
            
            var win135 = "C:\\Program Files\\Adobe\\Adobe After Effects CC 2015\\Support Files\\aerender.exe";
            var win13 = "C:\\Program Files\\Adobe\\Adobe After Effects CC 2014\\Support Files\\aerender.exe";
            var win12 = "C:\\Program Files\\Adobe\\Adobe After Effects CC\\Support Files\\aerender.exe";
            var win12 = "C:\\Program Files\\Adobe\\Adobe After Effects CS6\\Support Files\\aerender.exe";
            
            if (version == 13.5) {
                binPath = win135;
            }            
            if ( version >= 13.0 && version <= 13.2 ) {
                binPath = win13;
            }            
            if ( version >= 13.0 && version <= 13.2 ) {
                binPath = win13;
            }            
            if ( version >= 12.0 && version <= 12.2 ) {
                binPath = win12;
            }            
            if ( version == 11.0 ) {
                binPath = win11;
            }
            
            file = new File ( binPath )
            settings.aerender.aerender_bin = file.fsName;
            set( 'aerender_bin', settings.aerender.aerender_bin );
            
            return settings.aerender.aerender_bin
        }());
    }
    cls.setstring = function( inName, inText ){
        palette.findElement( inName ).text = inText;
    }
    return cls
})(this);
    var settings = new SettingsWindow;      
    var FrameWindow = ( function ( thisObj, inTitle, inNumColumns, columnTitles, columnWidths ) {
        
        var itemIndex = null;
        
        //Window Definition
        {
            var palette = thisObj instanceof Panel ? thisObj : new Window('palette', inTitle, undefined, {
                resizeable: false,
                maximumSize: ['', 400],
                margins: 10,
                spacing: 10
            });
            palette.alignChildren = "left";
            if (palette == null) return;
        }

        
        //Methods
        {
            var cls = function( ){
                this.setItemIndex = function ( index ) {
                    itemIndex = index;
                    return itemIndex;
                };
                this.getItemIndex = function ( ) {
                    return itemIndex;
                };
                this.show = function () {

                    palette.findElement('listItem').size.width = ( function () {
                        var width = 0;
                        for (var i = 0; i < inNumColumns; i++) {
                            width += parseInt ( columnWidths[i], 10 )
                        }
                        // Extra padding to avoid scrollbar
                        return width + 66
                    })();
                    if ( palette.findElement('listItem').size[1] > 500 ) {
                        palette.findElement('listItem').size.height = 500;
                    }
                    palette.layout.layout(true);
                    palette.layout.resize();

                    palette.show();
                };
                this.hide = function () {
                    if (!(palette instanceof Panel)) palette.hide();
                }
                this.disable = function ( ){
                    button_copy.enabled = false;
                    palette.update();
                    palette.layout.layout();
                }
                this.setlist = function ( inColumn1,inColumn2,inColumn3, inColumn4, inColumn5, inColumn6 ){
                    function ellipsis( inString ) {
                        if ( inString ) {
                            if (inString.length > 100) {
                                return inString.substr(0, 0) + '...' + inString.substr(inString.length - 100, inString.length);
                            }
                            return inString;
                        } else {
                            return ''
                        }
                    }
                    if (inColumn1.length > 0) {
                        var item = '';
                        for (var i = 0; i < inColumn1.length; i++) {
                            item = listItem.add('item', inColumn1[i]);
                            if ( inNumColumns >= 2 ) { item.subItems[0].text = ellipsis( inColumn2[i] ) };
                            if ( inNumColumns >= 3 ) { item.subItems[1].text = ellipsis( inColumn3[i] ) };
                            if ( inNumColumns >= 4 ) { item.subItems[2].text = ellipsis( inColumn4[i] ) };
                            if ( inNumColumns >= 5 ) { item.subItems[3].text = ellipsis( inColumn5[i] ) };
                            if ( inNumColumns >= 6 ) { item.subItems[4].text = ellipsis( inColumn6[i] ) };

                            if (inColumn2[i] === 'Invalid destination folder selected.' ) { break }
                        }
                    } else {
                        var ln1 = listItem.add('item', '');
                        var ln2 = listItem.add('item', '');
                        if ( inNumColumns >= 2 ) { ln1.subItems[0].text = 'No valid output modules found.' };
                        if ( inNumColumns >= 2 ) { ln2.subItems[0].text = 'Add items to your Render Queue before using this tool.' };
                    }
                    palette.layout.layout(true);
                    palette.layout.resize();
                }
                this.clear = function () {
                    var item = '';
                    for (var i = listItem.items.length-1; i > -1; i--) {
                        listItem.remove( listItem.items[i] );
                    }
                }
            }
        }
        var internal = {};
        internal.clear = function () {
            var item = '';
            for (var i = listItem.items.length-1; i > -1; i--) {
                listItem.remove( listItem.items[i] );
            }
        }
        internal.setlist = function ( inColumn1,inColumn2,inColumn3, inColumn4, inColumn5, inColumn6 ){
            function ellipsis( inString ) {
                if ( inString ) {
                    if (inString.length > 100) {
                        return inString.substr(0, 0) + '...' + inString.substr(inString.length - 100, inString.length);
                    }
                    return inString;
                } else {
                    return ''
                }
            }
            if (inColumn1.length > 0) {
                var item = '';
                for (var i = 0; i < inColumn1.length; i++) {
                    item = listItem.add('item', inColumn1[i]);
                    if ( inNumColumns >= 2 ) { item.subItems[0].text = ellipsis( inColumn2[i] ) };
                    if ( inNumColumns >= 3 ) { item.subItems[1].text = ellipsis( inColumn3[i] ) };
                    if ( inNumColumns >= 4 ) { item.subItems[2].text = ellipsis( inColumn4[i] ) };
                    if ( inNumColumns >= 5 ) { item.subItems[3].text = ellipsis( inColumn5[i] ) };
                    if ( inNumColumns >= 6 ) { item.subItems[4].text = ellipsis( inColumn6[i] ) };

                    if (inColumn2[i] === 'Invalid destination folder selected.' ) { break }
                }
            } else {
                var ln1 = listItem.add('item', '');
                var ln2 = listItem.add('item', '');
                if ( inNumColumns >= 2 ) { ln1.subItems[0].text = 'No valid output modules found.' };
                if ( inNumColumns >= 2 ) { ln2.subItems[0].text = 'Add items to your Render Queue before using this tool.' };
            }
            palette.layout.layout(true);
            palette.layout.resize();
        }
  
        //Event Functions
        {
            function button_cancel_onClick(){
                palette.hide();
                internal.clear()
            }
            function deleteButton_onClick(){
                if ( listItem.selection ) {
                    
                    var indexes = listItem.selection,
                        file = new File ('/c/temp01234.tmp'),
                        fsPath, result = false, changePath;
                    
                    var choice = confirm( 'Are you sure you want to delete the selected files?\n\nThis cannot be undone.', true, 'Confirm Delete' ) 
                    
                    if (choice) {
                        for (var i = 0; i < indexes.length; i++) {
                            fsPath = collect.item( itemIndex ).rendered.fsNames[ indexes[i].index ]
                            
                            // Ugly workaround for the async file.changePath
                            while ( !file.changePath( fsPath )) {
                                indexes[i].text = 'Updating...'
                            }
                            
                            if ( file.exists ){
                                result = file.remove();
                                if ( result ) {
                                    indexes[i].enabled = false;
                                    indexes[i].text = 'Deleted.'
                                }
                            }
                        }
                    }
                } else {
                    alert ('Select an item from the list below before continuing.')
                }
            }
            function browseButton_onClick(){
                var index = listItem.selection.index;
                collect.item( itemIndex ).file.parent.execute()
            }
            function refreshButton_onClick( ) {
                internal.clear();
                collect = new Collect;
                internal.setlist( collect.item( itemIndex ).rendered.names, collect.item( itemIndex ).rendered.sizes );
            }
        }
        //UI
        {
            // Header bar
            {
                var controlsGroup = palette.add('group',undefined,{
                    name: 'headerGroup',
                    orientation: 'row',
                    spacing: 10,
                    margins: 10
                });
                
                var deleteButton = controlsGroup.add('iconbutton',undefined,redbinPNG,{
                    name: 'deleteButton'
                });
                    deleteButton.size = [36,24];
                    deleteButton.onClick = deleteButton_onClick;
                
                
                var browseButton = controlsGroup.add('button',undefined,'Browse Folder',{
                    name: 'browseButton'
                });
                    browseButton.onClick = browseButton_onClick;
                
                
                var refreshButton = controlsGroup.add('button',undefined,'Refresh',{
                    name: 'refreshButton'
                });
                    refreshButton.onClick = refreshButton_onClick;
                
            }
            // List
            {
                var listGroup = palette.add('group', undefined, {
                    name: 'listGroup',
                    orientation: 'row',
                    spacing: 10,
                    margins: 10
                });
                var listItem = listGroup.add('listbox',undefined, '', {
                    spacing: 0,
                    margins: 0,
                    name: 'listItem',
                    multiselect: true,
                    numberOfColumns: inNumColumns,
                    showHeaders: true,
                    columnTitles: columnTitles,
                    columnWidths: columnWidths
                });
                listItem.onDoubleClick = function () { app.project.renderQueue.showWindow( true ) }
            }
            // Footer
            {
                var footerGroup = palette.add('group',undefined,{
                    alignChildren: ['left','top'],
                    orientation: 'row',
                    spacing: 0,
                    margins: 0
                });
                var button_cancel = footerGroup.add('button',undefined,'Close',{
                    name: 'button_cancel'
                });
                    button_cancel.onClick = button_cancel_onClick;
            }
        }
   
    return cls
    }(this, 'Remove Frames', 2, ['Name','Size'], [350,75]));
    var framesWindow = new FrameWindow;

    var Directory = ( function ( inPath ) {
        /*


        Directory Object
        ----------------

        Represents the name, last modified time, date and size of windows file system objects as provided by windows's 'dir' command.
        Constructor template via http://stackoverflow.com/questions/1114024/constructors-in-javascript-objects


        Usage

        var directory = new Directory( ExtendScript Folder Object )
        var files = directory.files()
        var folders = directory.folders()
        var itemname = files.item(0).size



        Object Methods

        All methods return an array of stat objects or an array of 1 item if File or Path is invalid.

        Directory.files()           --- Returns array of Stat Objects of visible files.        
        Directory.folders()         --- Returns folders only.
        Directory.hidden()          --- Returns all hidden items.
        Directory.hiddenFiles()     --- Returns idden files only.
        Directory.hiddenFolders()   --- Hidden folders only.



        Properties

        Method().names              --- Array of all item names.  
        Method().times              --- Array of all items' last modified time.    
        Method().dates              --- Array of all items' last modified date.    
        Method().sizes              --- Array of all item  items' last modified time.
        Method().items              --- Array of stat objects.  
        Method().item(index)        --- Get stat object by index.  
        Method().count              --- Number of items found.

        Method().item(0).name       --- Filename
        Method().item(0).size       --- Filesize in bytes. Folders return '<dir>'
        Method().item(0).date       --- Date of last modified
        Method().item(0).time       --- Time of last modified

        */

        // private static
        var nextId = 1;

        // constructor
        var cls = function ( inPath ) {
            // private
            var id = nextId++;
            var pathFile = new File ( inPath );

            // public (this instance only)
            this.getID = function () { return id; };
            this.changePath = function ( inPath ) {
                pathFile.changePath( inPath );
            }
            this.all = function () {
                var args = '/o:n';
                return this.callSystem( pathFile.fsName, args )
            };
            this.files = function ( mask ) {
                var args = '/o:n /a:-d-h';
                if (mask) {
                    return this.callSystem( pathFile.fsName + '\\' + mask, args )
                } else {
                    return this.callSystem( pathFile.fsName, args )
                }
            };
            this.folders = function () {
                var args = '/o:n /a:d-h';
                return this.callSystem( pathFile.fsName, args );
            };
            this.hiddenFiles = function () {
                var args = '/o:n /a:h-d';
                return this.callSystem( pathFile.fsName, args );
            };
            this.hiddenFolders = function () {
                var args = '/o:n /a:hd';
                return this.callSystem( pathFile.fsName, args );
            }
            this.hidden = function () {
                var args = '/o:n /a:h';
                return this.callSystem( pathFile.fsName, args );
            }
        };

        // public static
        cls.get_nextId = function () {
            return nextId;
        };

        // public (shared across instances)
        cls.prototype = {
            callSystem: function ( inPath, args ) {
                /* A helper function to extend the return of callSystem with addittional stats and methods. */
                var returnObject = function ( inArr ) {
                    var returnObj = {};
                        returnObj.items = inArr;
                        returnObj.item = function ( index ) {
                            return inArr[ index ] };
                        returnObj.count = inArr.length;
                        returnObj.names = (function ()
                        {
                            var returnArr = [];
                            for (var i = 0; i < inArr.length; i++ ){
                                returnArr.push( inArr[i].name );
                            }
                            return returnArr
                        })();
                        returnObj.dates = (function ()
                        {
                            var returnArr = [];
                            for (var i = 0; i < inArr.length; i++ ){
                                returnArr.push( inArr[i].date );
                            }
                            return returnArr
                        })();
                        returnObj.times = (function ()
                        {
                            var returnArr = [];
                            for (var i = 0; i < inArr.length; i++ ){
                                returnArr.push( inArr[i].time );
                            }
                            return returnArr
                        })();
                        returnObj.sizes = (function ()
                        {
                            var returnArr = [];
                            for (var i = 0; i < inArr.length; i++ ){
                                returnArr.push( inArr[i].time );
                            }
                            return returnArr
                        })();
                    return returnObj                            
                } // extend return

                var cmd = 'cmd /c "' + 'dir ' + '\"' + inPath + '\"' + ' ' + args + '"';
                try { var raw = system.callSystem( cmd ); } catch (e){ var raw = null; return null }
                try {
                    var stat = {}, stats = [], splitln, lines, noPath, noFile1, noFile2;

                    invalidFile = raw.indexOf('File Not Found');

                    noPath = raw.indexOf('The system cannot find the file specified.');
                    noFile1 = raw.indexOf('The system cannot find the path specified.');
                    noFile2 = raw.indexOf('File Not Found');


                    if ( ( noPath < 0 ) && ( noFile1 < 0 ) && ( noFile2 < 0 ) ) {
                        lines = raw.split('\n').slice(5).slice(0, -3);
                        for (var i = 0; i < lines.length; i++) {
                            splitLn = lines[i].split(/^((?:\S+\s+){3})/g);
                            var stat = {    
                                date: splitLn[1].split(/\s+/g)[0].replace(/\r|\n/g,''),
                                time: splitLn[1].split(/\s+/g)[1].replace(/\r|\n/g,''),
                                size: parseInt( splitLn[1].split(/\s+/g)[2].replace(/\r|\n/g,'').replace(/\,/gi,''), 10 ),
                                name: splitLn[2].replace(/\r|\n/g,'')
                            }                        
                            stats.push( stat );
                        }
                        return returnObject( stats )
                    }
                    // Return when dir cannot find the file but the path is valid.
                    if ( noFile1 >= 0 || noFile2 >= 0 ) {

                        stat = {
                                date: 'n/a',
                                time: 'n/a',
                                size: 'n/a',
                                name: 'The system cannot find the file specified.',
                                raw: raw
                        }
                        stats = [];
                        stats.push( stat );
                        return returnObject( stats )
                    }
                    // Return when dir cannot find the path specified.
                    if ( noPath >= 0 ) {
                        stat = {
                                date: 'n/a',
                                time: 'n/a',
                                size: 'n/a',
                                name: 'The system cannot find the path specified.',
                                raw: raw
                        }
                        stats = [];
                        stats.push( stat );
                        return returnObject( stats )
                    }
                } catch (e) {
                    stat = {
                        date: 'n/a',
                        time: 'n/a',
                        size: 'n/a',
                        name: 'Error.',
                        raw: raw
                    }
                    stats = [];
                    stats.push( stat );
                    return returnObject( stats )
                }
            } // callSystem
        }; // prototype
        return cls;
    }());
    var Collect = ( function (){
        
        /*
        
        Collect Object:
        
        Usage:
        var collect = new Collect;
        var items = collect.items;
        
        
        This Collection Will return these properties:
        
        collect.items               -- All items returned by this collector.
        collect.item(index)         -- Return an item from the collection (zero based index).
        
        collect.files               -- Array of Output Module File Objects.
        collect.compnames           -- Array of Render Queue item comp names.
        collect.sequencenames       -- Array of Render Queue item sequence names: 'filename_[from-to].extension'
        collect.filenames           -- Array of platform specific Output Module Filenames.
        collect.durations           -- Array of the durations of the existing Render Queue items.
        
        collect.rendered.frames     -- Array of the number of rendered frames of each out.
        collect.rendered.names      --
        collect.rendered.fsNames    --
        collect.rendered.sizes       -- Size of the rendered sequence ( bytes )
        collect.rendered.counts     --
        
        collect.missing.frames      -- All results collected into one array.
        collect.missing.names       --
        collect.missing.fsNames     --
        collect.missing.counts      --
        
        collect.incomplete.frames   --
        collect.incomplete.names    --
        collect.incomplete.fsNames  --
        collect.incomplete.counts   --
        collect.incomplete          --
        
        
        Item Properties
        
        item.comp               -- CompItem of the RenderQueue Item.
        item.compname           -- CompItem name.
        item.file               -- File Object of the output module.
        item.filename           -- Platform specific path.
        item.sequencename       -- Filename to display with sequence range included.
        item.ext                -- Extension of the output module file.
        item.padding            -- Number of padding of the sequence item.
        item.startframe         -- Start frame.
        item.endframe           -- End frame.
        item.duration           -- Duration.
        item.status             -- Status string
        
        item.rendered.frames    -- String representing the rendered frames: 0,1,2-10,55-65.
        item.rendered.names     -- Array of filenames.
        item.rendered.fsNames   -- Array of full paths.
        item.rendered.size      -- Array of full paths.
        item.rendered.count     -- Number of rendered frame. 
        
        item.missing.frames     -- String representing the rendered frames: 0,1,2-10,55-65.
        item.missing.names      -- Array of filenames.
        item.missing.fsNames    -- Array of full paths.
        item.missing.count      -- Number of rendered frame.   
        
        item.incomplete.frames  -- String representing the rendered frames: 0,1,2-10,55-65.
        item.incomplete.names   -- Array of filenames.
        item.incomplete.fsNames -- Array of full paths.
        item.incomplete.count   -- Number of rendered frame.
        
        */
        
        var nextId = 1;
        
        //Globals
        {
            var om = {};
            var items;
        }
        
        //Internals
        {
            function getPadding(n){var e=decodeURI(n).match(/\[#\]|\[##\]|\[###\]|\[####\]|\[#####\]|\[######\]/g);return e?e[0].length-2:null}
            function pad(a,b){for(var c=a+"";c.length<b;)c="0"+c;return c}
            //http://stackoverflow.com/questions/2270910/how-to-convert-sequence-of-numbers-in-an-array-to-range-of-numbers:
            function getRanges(c){for(var b=[],a,d=0;d<c.length;)b.push((a=c[d])+(function(b){for(;++a===c[++d];);return--‌​a===b}(a)?"":"-"+a));return b}
            //http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
            function formatBytes(a,b){if(0==a)return"0 Byte";var c=1024,d=b+1||3,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return(a/Math.pow(c,f)).toPrecision(d)+" "+e[f]}         
            //Array.indexOf Polyfill - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
            Array.prototype.indexOf||(Array.prototype.indexOf=function(a,b){var c;if(null==this)throw new TypeError('"this" is null or not defined');var d=Object(this),e=d.length>>>0;if(0===e)return-1;var f=+b||0;if(Math.abs(f)===1/0&&(f=0),f>=e)return-1;for(c=Math.max(f>=0?f:e-Math.abs(f),0);e>c;){if(c in d&&d[c]===a)return c;c++}return-1});
        }
        
        //Constructor
        var cls = function (){
            
            var id = nextId++;
            
            this.items = (function() {
                var rqItem, omItem, parent = null, objs = [];
                //Collect Info
                for (var i = 1; i <= app.project.renderQueue.numItems; i++) {
                    for (var j = 1; j <= app.project.renderQueue.item(i).numOutputModules; j++) {
                        omItem = app.project.renderQueue.item(i).outputModule(j);
                        rqItem = app.project.renderQueue.item(i);           
                        // Obj Definition
                        {
                            obj = {};
                            obj.comp = rqItem.comp;
                            obj.compname = rqItem.comp.name;
                            obj.rqindex = i;
                            obj.file = ( function () {
                                if ( omItem.file ) {
                                    return  omItem.file
                                } else {
                                    return null
                                }
                            })();
                            obj.filename = (function () {
                                if ( omItem.file ) {
                                    return decodeURI ( omItem.file.parent.name + '/' + omItem.file.name )
                                } else {
                                    var string = 'File not yet specified.'
                                    return  string
                                }
                            })();

                            obj.sequencename = null;
                            obj.ext = null;
                            obj.padding = null;
                            obj.startframe = null;
                            obj.endframe = null;
                            obj.duration = null;

                            obj.status = false;

                            obj.rendered = {
                                frames: null,
                                names: null,
                                fsNames: null,
                                size: null,
                                sizes: null,
                                count: null
                            };
                            obj.missing = {
                                frames: null,
                                names: null,
                                fsNames: null,
                                count: null
                            };
                            obj.incomplete = {
                                frames: null,
                                names: null,
                                fsName: null,
                                count: null
                            };
                        }
                        // Set Obj Properties
                        obj.set = (function () {

                            var oneframe = rqItem.comp.frameDuration;    
                            obj.startframe = Math.round((rqItem.timeSpanStart / oneframe) + (rqItem.comp.displayStartTime / oneframe)),
                            obj.endframe = Math.round((rqItem.timeSpanStart + rqItem.timeSpanDuration) /  oneframe) + (rqItem.comp.displayStartTime / oneframe) - 1,
                            obj.duration = obj.endframe - obj.startframe + 1; 

                            var stat, count;

                            if ( omItem.file ){
                                obj.padding = getPadding( omItem.file.name );
                                obj.ext = omItem.file.name.slice(-3);
                                obj.sequencename = decodeURI( decodeURI(omItem.file.name).slice(0, ((obj.padding + 2 + 4) * (-1)) )) + '[' + pad(obj.startframe, obj.padding) + '-' + pad(obj.endframe, obj.padding) + ']' + '.' + obj.ext;

                                var stat = new Directory ( omItem.file.parent );
                                var files = stat.files( '*' + obj.ext );
                                
                                (function () {
                                    
                                    var frame, name, names, fsName, index,
                                        existsNames = [], existsFrames = [], existsfsNames = [], existsSizes = []
                                        missingNames = [], missingFrames = [], missingfsNames = [],
                                        partialNames = [], partialFrames = [], partialfsNames = [],
                                        size = 0;
                                    
                                    if ( !(files.count == 1 && ( files.item(0).name === 'The system cannot find the file specified.' || files.item(0).name === 'The system cannot find the path specified.') )) {
                                        names = files.names;

                                        for (var i = 0; i < parseInt( obj.duration, 10 ); i++ ) {
                                            frame = pad(obj.startframe + i, obj.padding);
                                            name = decodeURI(omItem.file.name).slice(0, (obj.padding + 2 + 4) * (-1) ) + frame + '.' + obj.ext;
                                            index = names.indexOf( name );
                                            fsName = omItem.file.parent.fsName + '\\' + name;
                                            
                                            //Frame Exists
                                            if ( index >= 0) {
                                                existsNames.push( name );
                                                existsFrames.push( parseInt(frame, 10) );
                                                existsfsNames.push( fsName );
                                                size = files.item( index ).size;
                                                existsSizes.push( formatBytes(size,2) );
                                            }
                                            //Frame Missing
                                            if ( index == -1 ) {
                                                missingNames.push( name );
                                                missingFrames.push( parseInt(frame, 10) );
                                                missingfsNames.push( fsName );
                                            }
                                        }

                                        for ( i = 0; i < existsNames.length; i++ ) {
                                            if ( files.item(i).size < 50 ) {
                                                partialNames.push( name );
                                                partialFrames.push( existsFrames[i] );
                                                partialfsNames.push( fsName );
                                            }
                                            size += files.item(i).size ;
                                        }
                                        
                                        obj.rendered = {
                                            frames: getRanges( existsFrames ),
                                            names: existsNames,
                                            fsNames: existsfsNames,
                                            size: formatBytes(size,2),
                                            sizes: existsSizes,
                                            count: existsNames.length
                                        };
                                        obj.missing = {
                                            frames: getRanges( missingFrames ),
                                            names: missingNames,
                                            fsNames: missingfsNames,
                                            count: missingNames.length
                                        };
                                        obj.incomplete = {
                                            frames: getRanges( partialFrames ),
                                            names: partialNames,
                                            fsName: partialfsNames,
                                            count: partialNames.length
                                        };
                                    }
                                })();
                            } else {
                                obj.sequencename = 'File not yet specified.';
                                obj.ext = null;
                                obj.padding = null;
                            }
                            
                        })();
                        //PUSH IT PUSH PUSH IT REAL HARD
                        objs.push( obj );
                    }
                }
                items = objs;
                return objs
            }());
            this.item = function ( index ) {
                return items[ index ]
            }
            this.files = (function() {
                var arr = [];
                if ( items.length === 0 ) {
                    arr = ['No active output modules found.']
                    return arr
                } else {
                    for (var i = 0; i < items.length; i++) {
                        arr.push( items[i].file );
                    }
                    return arr
                }
            }());
            this.compnames = (function() {
                var arr = [];
                if ( items.length === 0 ) {
                    arr = ['No active output modules found.']
                    return arr
                } else {
                    for (var i = 0; i < items.length; i++) {
                        arr.push( items[i].compname );
                    }
                    return arr
                }
            }());
            this.rqindexes = (function() {
                var arr = [];
                if ( items.length === 0 ) {
                    arr = ['No active output modules found.']
                    return arr
                } else {
                    for (var i = 0; i < items.length; i++) {
                        arr.push( items[i].rqindex );
                    }
                    return arr
                }
            }());
            this.sequencenames = (function() {
                var arr = [];
                if ( items.length === 0 ) {
                    arr = ['No active output modules found.']
                    return arr
                } else {
                    for (var i = 0; i < items.length; i++) {
                        arr.push( items[i].sequencename );
                    }
                    return arr
                }
            }());
            this.filenames = (function() {
                var arr = [];
                if ( items.length === 0 ) {
                    arr = ['No active output modules found.']
                    return arr
                } else {
                    for (var i = 0; i < items.length; i++) {
                        arr.push( items[i].file.parent.name + '/' + items[i].sequencename );
                    }
                    return arr
                }
            }());
            this.durations = (function() {
                var arr = [];
                if ( items.length === 0 ) {
                    arr = ['No active output modules found.']
                    return arr
                } else {
                    for (var i = 0; i < items.length; i++) {
                        arr.push( items[i].duration );
                    }
                    return arr
                }
            }());
            this.rendered = (function() {
                var returnObj = {
                    frames: [], names: [], fsNames: [], sizes: [], counts: []
                }
                
                if ( items.length === 0 ) {
                    return returnObj
                } else {
                    for (var i = 0; i < items.length; i++) {
                        returnObj.frames.push( items[i].rendered.frames );
                        returnObj.names.push( items[i].rendered.names );
                        returnObj.fsNames.push( items[i].rendered.fsNames );
                        returnObj.sizes.push( items[i].rendered.size );
                        returnObj.counts.push( items[i].rendered.count );
                    }                    
                    return returnObj
                }
            }());
            this.missing = (function() {
                var returnObj = {
                    frames: [],
                    names: [],
                    fsNames: [],
                    counts: []
                }
                var frames = [], names = [], fsNames = [], counts = [];
                if ( items.length === 0 ) {
                    return returnObj
                } else {
                    for (var i = 0; i < items.length; i++) {
                        frames.push( items[i].missing.frames );
                        names.push( items[i].missing.names );
                        fsNames.push( items[i].missing.fsNames );
                        counts.push( items[i].missing.count );
                    }
                    returnObj.frames = frames;
                    returnObj.names = names;
                    returnObj.fsNames = fsNames;
                    returnObj.counts = counts;
                    
                    return returnObj
                }
            }());
            this.incomplete = (function() {
                var returnObj = {
                    frames: [],
                    names: [],
                    fsNames: [],
                    counts: []
                }
                var frames = [], names = [], fsNames = [], counts = [];
                if ( items.length === 0 ) {
                    return returnObj
                } else {
                    for (var i = 0; i < items.length; i++) {
                        frames.push( items[i].incomplete.frames );
                        names.push( items[i].incomplete.names );
                        fsNames.push( items[i].incomplete.fsNames );
                        counts.push( items[i].incomplete.count );
                    }
                    returnObj.frames = frames;
                    returnObj.names = names;
                    returnObj.fsNames = fsNames;
                    returnObj.counts = counts;
                    
                    return returnObj
                }
            }());
        }
        return cls
    }());
    var ListWindow = ( function ( thisObj, inTitle, inNumColumns, columnTitles, columnWidths ) {
       //Window Definition
        {
            var palette = thisObj instanceof Panel ? thisObj : new Window('palette', inTitle, undefined, {
                resizeable: false,
                orientation: 'row'
            });
            if (palette == null) return;
        }
        //Event Functions
        {
            function button_cancel_onClick(){
                palette.close()
            }
            function playButton_onClick(){
                if ( listItem.selection ) {
                    
                    var index = listItem.selection.index,
                        rvPath = settings.getSetting('rv_bin'),
                        rvCall = settings.getSetting('rv_call'),
                        item = collect.item( index ),
                        sequencePath = item.file.fsName,
                        file = new File ( tempDir.fullName + '/tmp_0000.bat' )
                    
                    var rvSequencePath = sequencePath.slice(0,-4).slice(0, -1*(item.padding + 2) ) + '%%0' + item.padding + 'd' + '.' + item.ext;
                    var rvRange = item.startframe + '-' + item.endframe;
                    var cmd = '\"' + rvPath + '\"' + ' ' + '\"' + rvSequencePath + '\"' + ' ' + rvRange + ' ' + rvCall;
                    
                    var string = '@echo off\n' +
                                'start "" ' + cmd + '\n'+
                                'exit /b';
                    
                    file.open('w');
                    file.write(string);
                    file.close();
                    
                    file.execute();
                }
            }
            function browseButton_onClick(){
                if ( listItem.selection ) {
                    var index = listItem.selection.index;
                    //Parent
                    if ( collect.item( index ).file.parent.exists ) {
                       collect.item( index ).file.parent.execute() 
                    } else {
                        //Grandparent
                       if ( collect.item( index ).file.parent.parent.exits ) {
                           collect.item( index ).file.parent.parent.execute()
                       } else {
                           //Great grandparent
                           if ( collect.item( index ).file.parent.parent.parent.exists ) {
                               collect.item( index ).file.parent.parent.parent.execute()
                           }
                       }
                    }
                    
                }
            }
            function settingsButton_onClick(){
                settings.show();
            }
            function refreshButton_onClick(){
                collect = new Collect;
                listWindow.clear();
                listWindow.setlist( collect.compnames, collect.filenames, collect.rendered.frames, collect.missing.frames, collect.incomplete.frames, collect.rendered.sizes );
                
            }            
            function framesButton_onClick(){
                if ( listItem.selection ) {
                    var index = listItem.selection.index;
                    framesWindow.clear();
                    framesWindow.setItemIndex( index );
                    framesWindow.setlist( collect.item( index ).rendered.names, collect.item( index ).rendered.sizes )
                    framesWindow.show();
                }
            }            
            function aerenderButton_onClick(){
                 if ( listItem.selection ) {
                      var index = listItem.selection.index;
                     var aerenderPath = settings.getSetting( 'aerender_bin' );
                     try {
                         
                     var bat = new File(tempDir.fullName + "/" + app.project.file.name + ".bat");
                         
                     var cmd = '"' + aerenderPath + '"' +
                                ' -project "' + app.project.file.fsName + '"' +
                                ' -rqindex ' + collect.item( index ).rqindex +
                                ' -s ' + parseInt( collect.item( index ).startframe, 10) +
                                ' -e ' + parseInt( collect.item( index ).endframe, 10) +
                                ' -sound ON -continueOnMissingFootage'
                        
                        var start = 'start \"' + app.project.file.name + '\" ' + cmd;

                        bat.open('w');
                        bat.write(start);
                        bat.close();
                        
                        bat.execute();
                     } catch(e) {
                         alert(e)
                         alert('You must save the project before continuing.')
                     }
                 }
            }
        }
        //UI
        {
            // Header bar
            {
                var controlsGroup = palette.add('group',undefined,{
                    name: 'controlsGroup',
                });
                    controlsGroup.orientation = 'row';
                    controlsGroup.spacing = 2;
                    controlsGroup.alignment = 'left';
                
                var aerenderButton = controlsGroup.add('button',undefined, 'Start Background Render',{
                    name: 'aerenderButton'
                });
                    aerenderButton.onClick = aerenderButton_onClick;
                    aerenderButton.size = [175,32];
                    aerenderButton.alignment = 'left';
                
                 var sep1 = controlsGroup.add('panel');
                    sep1.minimumSize.width = sep1.maximumSize.width = 2;
                    sep1.minimumSize.height = sep1.maximumSize.height = 30;
                    sep1.border = 'none';
                
                var playButton = controlsGroup.add('iconbutton',undefined, ListWindow_PlayIcon,{
                    name: 'playButton'
                });
                    playButton.onClick = playButton_onClick;
                    playButton.size = [32,32];
                    playButton.alignment = 'left';
                
                var browseButton = controlsGroup.add('iconbutton',undefined,ListWindow_RevealIcon,{
                    name: 'browseButton'
                });
                    browseButton.onClick = browseButton_onClick;
                    browseButton.size = [32,32];
                
                var framesButton = controlsGroup.add('iconbutton',undefined,ListWindow_FilesIcon,{
                    name: 'framesButton',
                });
                    framesButton.onClick = framesButton_onClick; 
                    framesButton.size = [32,32];
                
                var refreshButton = controlsGroup.add('iconbutton',undefined,ListWindow_RefreshIcon,{
                    name: 'refreshButton',
                });
                    refreshButton.onClick = refreshButton_onClick;
                    refreshButton.size = [32,32];
                
                    var sep2 = controlsGroup.add('panel');
                        sep2.minimumSize.width = sep2.maximumSize.width = 2;
                        sep2.minimumSize.height = sep2.maximumSize.height = 30;
                        sep2.border = 'none'
                    
                    
                var settingsButton = controlsGroup.add('iconbutton',undefined,ListWindow_SettingsIcon,{
                    name: 'settingsButton',
                });
                    settingsButton.onClick = settingsButton_onClick; 
                    settingsButton.size = [32,32];
                    settingsButton.alignment = 'right';
            }
            // List
            {
                var listGroup = palette.add('group', undefined, {
                    name: 'listGroup',
                    orientation: 'row',
                    spacing: 10,
                    margins: 10
                });
                var listItem = listGroup.add('listbox',undefined, '', {
                    spacing: 0,
                    margins: 0,
                    name: 'listItem',
                    size: [400,50],
                    multiselect: false,
                    numberOfColumns: inNumColumns,
                    showHeaders: true,
                    columnTitles: columnTitles,
                    columnWidths: columnWidths
                });
            }
            // Footer
            {
                var footerGroup = palette.add('group',undefined,{
                    spacing: 0,
                    margins: 0
                });
                    footerGroup.alignment = ['left', 'top'];
                    footerGroup.alignChildren = 'fill';
                    footerGroup.orientation = 'row';
                var button_cancel = footerGroup.add('button',undefined,'Close',{
                    name: 'button_cancel'
                });
                    button_cancel.onClick = button_cancel_onClick;
            }
        }
        //Internal Methods
        var cls = function( ){
            this.show = function () {
                palette.findElement('listItem').size.width = ( function () {
                    var width = 0;
                    for (var i = 0; i < inNumColumns; i++) {
                        width += parseInt ( columnWidths[i], 10 )
                    }
                    // Extra padding to avoid scrollbar
                    return width + 66
                })();
                if ( palette.findElement('listItem').size[1] > 500 ) {
                    palette.findElement ('listItem').size.height = 500;
                }
                palette.layout.layout(true);
                palette.layout.resize();
                //palette.onResizing = palette.onResize = function () { palette.layout.resize(); }
                if (!(palette instanceof Panel)) palette.show();
            };
            this.hide = function () {
                if (!(palette instanceof Panel)) palette.hide();
            }
            this.setlist = function ( inColumn1,inColumn2,inColumn3, inColumn4, inColumn5 , inColumn6 ){
                function ellipsis( inString ) {
                    if ( inString ) {
                        if (inString.length > 100) {
                            return inString.substr(0, 0) + '...' + inString.substr(inString.length - 100, inString.length);
                        }
                        return inString;
                    } else {
                        return '-'
                    }
                }
                
                if (inColumn1.length > 0) {
                    var item = '';
                    for (var i = 0; i < inColumn1.length; i++) {
                        item = palette.findElement('listItem').add('item', inColumn1[i]);
                        if ( inNumColumns >= 2 ) { item.subItems[0].text = ellipsis( inColumn2[i] ) };
                        if ( inNumColumns >= 3 ) { item.subItems[1].text = ellipsis( inColumn3[i] ) };
                        if ( inNumColumns >= 4 ) { item.subItems[2].text = ellipsis( inColumn4[i] ) };
                        if ( inNumColumns >= 5 ) { item.subItems[3].text = ellipsis( inColumn5[i] ) };
                        if ( inNumColumns >= 6 ) { item.subItems[4].text = ellipsis( inColumn6[i] ) };

                        if (inColumn2[i] === 'Invalid destination folder selected.' ) { break }
                    }
                } else {
                    var ln1 = palette.findElement('listItem').add('item', '');
                    var ln2 = palette.findElement('listItem').add('item', '');
                    if ( inNumColumns >= 2 ) { ln1.subItems[0].text = 'No valid output modules found.' };
                    if ( inNumColumns >= 2 ) { ln2.subItems[0].text = 'Add items to your Render Queue before using this tool.' };
                }
                listItem.onDoubleClick = function () { app.project.renderQueue.showWindow() }
                
                var lineH = 19;
                try{
                    if( palette.findElement('listItem').size[1] > 30*lineH ) {
                        palette.findElement('listItem').size[1] = 30*lineH;   
                    } else {
                        palette.findElement('listItem').size = [palette.findElement('listItem').size[0], (53 - lineH) + (lineH * inColumn1.length)]
                    }
                } catch(e){  
                };
                palette.layout.layout(true);
            }
            this.disable = function ( ){
                button_copy.enabled = false;
                palette.update();
                palette.layout.layout();
            }
            this.clear = function () {
                var item = '';
                for (var i = listItem.items.length-1; i > -1; i--) {
                    listItem.remove( listItem.items[i] );
                }
            }
        }
    return cls
    }(this, 'RV Review', 6, ['Compname','Path','Complete','Missing','Incomplete','Size'], [250,550,100,100,100,70]));
    
    var collect = new Collect;
    var listWindow = new ListWindow;

    listWindow.setlist( collect.compnames, collect.filenames, collect.rendered.frames, collect.missing.frames, collect.incomplete.frames, collect.rendered.sizes );
    listWindow.show()

    return this
})();