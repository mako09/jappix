/*

Jappix - An open social platform
These are the http-auth JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Kload

*/

// Bundle
var HTTPAuth = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	/**
     * Login to a HTTP session
     * @public
     * @param {string} lNick
     * @param {string} lPass
     * @param {string} lServer
     * @param {number} lPriority
     * @return {boolean}
     */
    self.go = function(lNick, lPass, lServer, lPriority) {

        try {
            // We add the login wait div
            Interface.showGeneralWait();
            
            oArgs = {};

            if(Common.hasWebSocket()) {
                // WebSocket supported & configured
                con = new JSJaCWebSocketConnection({
                    httpbase: HOST_WEBSOCKET
                });
            } else {
                var httpbase = (HOST_BOSH_MAIN || HOST_BOSH);

                // Check BOSH origin
                BOSH_SAME_ORIGIN = Origin.isSame(httpbase);
                
                // We create the new http-binding connection
                con = new JSJaCHttpBindingConnection({
                    httpbase: httpbase
                });
            }
            
            // And we handle everything that happen
            self.setupCon(con);
            
            // Generate a resource
            var random_resource = DataStore.getDB(Connection.desktop_hash, 'session', 'resource');
            
            if(!random_resource) {
                random_resource = JAPPIX_RESOURCE + ' (' + (new Date()).getTime() + ')';
            }
            
            // Generate a priority
            lPriority = lPriority ? lPriority : 10;

            // We retrieve what the user typed in the login inputs
            oArgs = {};
            oArgs.domain = $.trim(lServer);
            oArgs.username = $.trim(lNick);
            oArgs.resource = random_resource;
            oArgs.pass = lPass;
            oArgs.secure = true;
            oArgs.xmllang = XML_LANG;
            
            // Store the resource (for reconnection)
            DataStore.setDB(Connection.desktop_hash, 'session', 'resource', random_resource);
            
            // Generate a session XML to be stored
            session_xml = '<session><stored>true</stored><domain>' + lServer.htmlEnc() + '</domain><username>' + lNick.htmlEnc() + '</username><resource>' + random_resource + '</resource><password>' + lPass.htmlEnc() + '</password><priority>' + (lPriority + '').htmlEnc() + '</priority></session>';
            
            // Save the session parameters (for reconnect if network issue)
            Connection.current_session = session_xml;
            
            // We store the infos of the user into the data-base
            DataStore.setDB(Connection.desktop_hash, 'priority', 1, 10);
            
            // We connect !
            con.connect(oArgs);
            
            // Change the page title
            Interface.title('wait');
            
            Console.info('Jappix is connecting...');
        } catch(e) {
            Console.error('HTTPAuth.go', e);

            // Reset Jappix
            Talk.destroy();
            
            // Open an unknown error
            Board.openThisError(2);
        } finally {
            return false;
        }

    };


    /**
     * Return class scope
     */
    return self;

})();