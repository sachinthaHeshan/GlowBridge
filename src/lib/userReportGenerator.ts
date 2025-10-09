import jsPDF from "jspdf";
import { User } from "@/lib/userApi";

export interface UserReportFilters {
  reportType: "user-list" | "role-analysis";
  roleFilter: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
}

export class UserReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private yPosition: number;
  private lineHeight: number;
  private margin: number;
  private primaryColor: string;
  private lightColor: string;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.yPosition = 20;
    this.lineHeight = 7;
    this.margin = 20;
    this.primaryColor = "#3B82F6";
    this.lightColor = "#EBF4FF";
  }

  private checkPageBreak(additionalSpace: number = 20): void {
    if (this.yPosition > this.pageHeight - 30 - additionalSpace) {
      this.doc.addPage();
      this.yPosition = 20;
      this.addPageHeader();
    }
  }

  private addPageHeader(): void {
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(this.primaryColor);
    this.doc.text(
      "GlowBridge Salon Management System",
      this.margin,
      this.yPosition
    );
    this.yPosition += 15;
  }

  private addText(
    text: string,
    fontSize: number = 10,
    isBold: boolean = false,
    color: string = "#000000"
  ): void {
    this.checkPageBreak();

    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", isBold ? "bold" : "normal");
    this.doc.setTextColor(color);

    const textLines = this.doc.splitTextToSize(
      text,
      this.pageWidth - 2 * this.margin
    );
    this.doc.text(textLines, this.margin, this.yPosition);
    this.yPosition += textLines.length * this.lineHeight;
  }

  private getRoleLabel(role: string): string {
    switch (role) {
      case "admin":
        return "Admin";
      case "salon_staff":
        return "Staff";
      case "salon_owner":
        return "Salon Owner";
      case "customer":
        return "Customer";
      default:
        return role;
    }
  }

  public generateReport(data: User[], filters: UserReportFilters): void {
    try {
      this.addPageHeader();

      const reportTitle =
        filters.reportType === "user-list"
          ? "USER LIST REPORT"
          : "USER ROLE ANALYSIS REPORT";

      this.addText(reportTitle, 16, true, this.primaryColor);
      this.yPosition += 5;

      this.addText(`Generated on: ${new Date().toLocaleString()}`, 10);

      // Add filter information
      if (filters.roleFilter && filters.roleFilter !== "all") {
        this.addText(
          `Role Filter: ${this.getRoleLabel(filters.roleFilter)}`,
          10
        );
      }
      if (filters.statusFilter && filters.statusFilter !== "all") {
        this.addText(
          `Status Filter: ${
            filters.statusFilter.charAt(0).toUpperCase() +
            filters.statusFilter.slice(1)
          }`,
          10
        );
      }
      if (filters.dateFrom || filters.dateTo) {
        const from = filters.dateFrom
          ? new Date(filters.dateFrom).toLocaleDateString()
          : "Beginning";
        const to = filters.dateTo
          ? new Date(filters.dateTo).toLocaleDateString()
          : "Present";
        this.addText(`Date Range: ${from} - ${to}`, 10);
      }

      this.yPosition += 10;

      this.addText("SUMMARY:", 12, true);
      this.yPosition += 5;

      // Calculate statistics
      const totalUsers = data.length;
      const activeUsers = data.filter((u) => u.status === "active").length;
      const inactiveUsers = data.filter((u) => u.status === "inactive").length;

      // Count by role
      const adminCount = data.filter((u) => u.role === "admin").length;
      const staffCount = data.filter((u) => u.role === "salon_staff").length;
      const ownerCount = data.filter((u) => u.role === "salon_owner").length;
      const customerCount = data.filter((u) => u.role === "customer").length;

      this.addText(`• Total Users: ${totalUsers}`);
      this.addText(`• Active Users: ${activeUsers}`);
      this.addText(`• Inactive Users: ${inactiveUsers}`);
      this.yPosition += 5;
      this.addText(`• Admins: ${adminCount}`);
      this.addText(`• Staff: ${staffCount}`);
      this.addText(`• Salon Owners: ${ownerCount}`);
      this.addText(`• Customers: ${customerCount}`);

      this.yPosition += 10;

      if (filters.reportType === "user-list") {
        this.addText("DETAILED USER LIST:", 12, true);
        this.yPosition += 5;

        data.forEach((user, index) => {
          if (this.yPosition > this.pageHeight - 60) {
            this.doc.addPage();
            this.yPosition = 20;
          }

          this.addText(`${index + 1}. ${user.name}`, 11, true);
          this.addText(`   Email: ${user.email}`);
          this.addText(`   Phone: ${user.phone}`);
          this.addText(`   Role: ${this.getRoleLabel(user.role)}`);
          this.addText(`   Status: ${user.status.toUpperCase()}`);
          this.addText(
            `   Join Date: ${new Date(user.joinDate).toLocaleDateString()}`
          );
          if (user.salonId) {
            this.addText(`   Salon ID: ${user.salonId}`);
          }
          this.yPosition += 5;
        });
      } else {
        // Role analysis report
        this.addText("ROLE DISTRIBUTION ANALYSIS:", 12, true);
        this.yPosition += 5;

        const roles = [
          {
            name: "Admin",
            count: adminCount,
            percentage: ((adminCount / totalUsers) * 100).toFixed(1),
          },
          {
            name: "Staff",
            count: staffCount,
            percentage: ((staffCount / totalUsers) * 100).toFixed(1),
          },
          {
            name: "Salon Owner",
            count: ownerCount,
            percentage: ((ownerCount / totalUsers) * 100).toFixed(1),
          },
          {
            name: "Customer",
            count: customerCount,
            percentage: ((customerCount / totalUsers) * 100).toFixed(1),
          },
        ];

        roles.forEach((role) => {
          this.addText(
            `${role.name}: ${role.count} users (${role.percentage}%)`
          );
        });

        this.yPosition += 10;
        this.addText("STATUS DISTRIBUTION:", 12, true);
        this.yPosition += 5;

        const activePercentage = ((activeUsers / totalUsers) * 100).toFixed(1);
        const inactivePercentage = ((inactiveUsers / totalUsers) * 100).toFixed(
          1
        );

        this.addText(`Active: ${activeUsers} users (${activePercentage}%)`);
        this.addText(
          `Inactive: ${inactiveUsers} users (${inactivePercentage}%)`
        );

        // Add users by role
        this.yPosition += 10;
        this.addText("USERS BY ROLE:", 12, true);
        this.yPosition += 5;

        const groupedByRole = {
          admin: data.filter((u) => u.role === "admin"),
          salon_staff: data.filter((u) => u.role === "salon_staff"),
          salon_owner: data.filter((u) => u.role === "salon_owner"),
          customer: data.filter((u) => u.role === "customer"),
        };

        Object.entries(groupedByRole).forEach(([role, users]) => {
          if (users.length > 0) {
            this.checkPageBreak(40);
            this.addText(
              `${this.getRoleLabel(role)} (${users.length}):`,
              11,
              true
            );
            users.forEach((user) => {
              this.addText(`  • ${user.name} - ${user.email} (${user.status})`);
            });
            this.yPosition += 3;
          }
        });
      }

      const reportTypeName =
        filters.reportType === "user-list" ? "User_List" : "Role_Analysis";
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `GlowBridge_User_${reportTypeName}_Report_${timestamp}.pdf`;

      this.doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      throw new Error("Failed to generate PDF report");
    }
  }
}
