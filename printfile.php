<div id="print">
    <div style="text-align:center;">CLASS SCHEDULE</div>
    <!-- Student information table -->
    <table id="student_info_table">
        <tr>
            <td style="width:60px;">Student:</td>
            <td id="stud_name" style="width:50%;border-bottom:1px solid black;"></td>
            <td style="width:10px;"></td>
            <td style="width:35px;">PIN:</td>
            <td id="stud_pin" style="border-bottom:1px solid black;"></td>
            <td style="width:10px;"></td>
            <td style="width:18%;"><?php echo date('M j, Y'); ?></td>
        </tr>
    </table>
    <br/>
    <div id="new_student_message"></div>
    <!-- Weekly Schedule table -->
    <table id="weekly_table">
    </table>
    <br/>
    <!-- Schedule List table -->
    <table>
        <thead id="schedule_list_head">
            <tr>
                <th style="border-bottom:1px solid black;width:75px;text-align:left;">Subject</th>
                <th style="border-bottom:1px solid black;width:50px;text-align:left;">Cat. No.</th>
                <th style="border-bottom:1px solid black;width:50px;text-align:left;">Section</th>
                <th style="border-bottom:1px solid black;width:70px;text-align:left;">Class Nbr.</th>
                <th style="border-bottom:1px solid black;text-align:left;">Title</th>
                <th style="border-bottom:1px solid black;width:60px;text-align:left;">Credits</th>
            </tr>
        </thead>
        <tbody id="schedule_list_body">
        </tbody>
    </table>
    <div id="total_credits" style="text-align:right;"></div>
    <br/>
    <!-- Alternate Sections -->
    <div>Alternate courses (NOT alternate sections):</div>
    <table id="alternate_table">
        <tr>
            <td style="border-bottom:1px solid black;width:70px;"><br/><br/></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:70px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:75px;"></td>
        </tr>
        <tr>
            <td style="border-bottom:1px solid black;width:70px;"><br/><br/></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:70px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:75px;"></td>
        </tr>
        <tr>
            <td style="border-bottom:1px solid black;width:70px;"><br/><br/></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:70px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:75px;"></td>
        </tr>
        <tr>
            <td style="border-bottom:1px solid black;width:70px;"><br/><br/></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:55px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:70px;"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black"></td>
            <td style="width:5px;"></td>
            <td style="border-bottom:1px solid black;width:75px;"></td>
        </tr>
    </table>
    <br/>
    <!-- Signatures table -->
    <table id="signature_table">
        <tr>
            <td style="width:125px;">Student's Signature:</td>
            <td style="border-bottom:1px solid black;"></td>
            <td style="width:25px"></td>
            <td style="width:30px;">Date:</td>
            <td style="border-bottom:1px solid black;width:25%;"></td>
        </tr>
        <tr>
            <td><br/></td>
        </tr>
        <tr>
            <td>Advisor's Signature:</td>
            <td style="border-bottom:1px solid black;"></td>
            <td></td>
            <td>Date:</td>
            <td style="border-bottom:1px solid black;"></td>
        </tr>
    </table>
</div>