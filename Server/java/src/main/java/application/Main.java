package application;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import connection.Server;

public class Main {
	public static void main(String args[]) throws URISyntaxException {
		System.out.println();
		try {
			System.out.println("Running");
			new Server("localHost", 9000).start();
			java.awt.Desktop.getDesktop().browse(new URI("http://localhost:9000/web/index.html"));
		} catch (IOException e) {
			e.printStackTrace();
		}

		try {
            System.in.read();
        } catch (Throwable ignored) {
        }
	}
}
