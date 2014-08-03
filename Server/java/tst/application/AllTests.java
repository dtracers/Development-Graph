package application;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

import connection.ConnectionTests;
import utilities.UtilityTests;
import website.WebsiteTests;

@RunWith(Suite.class)
@SuiteClasses({UtilityTests.class, ConnectionTests.class, WebsiteTests.class})
public class AllTests {

}
