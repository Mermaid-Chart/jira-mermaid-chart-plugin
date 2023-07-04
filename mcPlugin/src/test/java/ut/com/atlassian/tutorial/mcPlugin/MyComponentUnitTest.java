package ut.com.atlassian.tutorial.mcPlugin;

import org.junit.Test;
import com.atlassian.tutorial.mcPlugin.api.MyPluginComponent;
import com.atlassian.tutorial.mcPlugin.impl.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}