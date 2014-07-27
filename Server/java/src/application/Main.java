package application;

import java.io.IOException;

import connection.Server;

public class Main {
	public static void main(String args[]) {
		System.out.println();
		try {
			System.out.println("Running");
			new Server("localHost", 9000).start();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		try {
            System.in.read();
        } catch (Throwable ignored) {
        }
	}
}
