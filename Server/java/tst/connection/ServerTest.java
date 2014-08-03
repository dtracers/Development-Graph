package connection;

import static org.mockito.Mockito.*;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.junit.After;
import org.junit.Before;

public class ServerTest {
	
	Server serv;
	/**
     * Sets up the test fixture. 
     * (Called before every test case method.)
	 * @throws IOException 
	 * @throws URISyntaxException 
     */
    @Before
    public void setUp() throws IOException, URISyntaxException {
		System.out.println("Running server");
		serv = new Server("localHost", 9000);
		serv.start();
		java.awt.Desktop.getDesktop().browse(new URI("http://localhost:9000/web/index.html"));
    }

    /**
     * Tears down the test fixture. 
     * (Called after every test case method.)
     */
    @After
    public void tearDown() {
        serv.closeAllConnections();
    }
}
